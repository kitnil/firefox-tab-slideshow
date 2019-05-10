var t = null;
var slideshowWindows = new Array();
var defaults = {
	interval: 15,
	order: "forward",
	reload: false,
	automaticallyStart: false
}
var interval = 15;
var order = "forward";
var reload = false;
var automaticallyStart = false;

function slideshowWindow(id) {
	this.id = id;
	this.count = 0;
}

function setWindowIconTitle(windowId) {
	var path = "icons/tab-slideshow-we-2colors.svg";
	var title = browser.i18n.getMessage("browserActionTitle");
	if (containsSlideshowWindowId(windowId)) {
		path = "icons/tab-slideshow-we-2-2colors.svg";
		title = browser.i18n.getMessage("browserActionTitleRunning");
	}
	browser.browserAction.setIcon({
		path: path,
		windowId: windowId
	});
	browser.browserAction.setTitle({
		title: title,
		windowId: windowId
	});
}

function containsSlideshowWindowId(id) {
	var b = false;
	for (var sw of slideshowWindows) {
		if (sw.id == id) {
			b = true;
			break;
		}
	}
	return b;
}

function timer() {
	var changeWindowIds = new Array();
	for (var sw of slideshowWindows) {
		sw.count = sw.count + 1;
		if (interval <= sw.count) {
			changeWindowIds.push(sw.id);
			sw.count = 0;
		}
	}
	for (var changeWindowId of changeWindowIds) {
		browser.tabs.query({
			windowId: changeWindowId
		}, (tabs) => {
			var array = new Array(tabs.length);
			var activeTabId = 0;
			for (var i = 0; i < tabs.length; i++) {
				array[i] = tabs[i].id;
				if (tabs[i].active == true) {
					activeTabId = tabs[i].id;
				}
			}
			var nextTabId = array[0];
			if(order == "random"){
				for (var i = 0; i < array.length; i++) {
					if (array[i] == activeTabId) {
						array.splice(i, 1);
						break;
					}
				}
				if(0 < array.length){
					nextTabId = array[Math.floor(Math.random()*array.length)];
				}
			}
			else if(order == "reverse"){
				if(array.indexOf(activeTabId) != 0){
					nextTabId = array[array.indexOf(activeTabId) - 1];
				}else{
					nextTabId = array[array.length - 1];
				}
			}else{
				if(array.indexOf(activeTabId) != array.length - 1) {
					nextTabId = array[array.indexOf(activeTabId) + 1];
				}
			}
			browser.tabs.update(nextTabId, {
				active: true
			});
			if(reload){
				browser.tabs.reload(nextTabId);
			}
		});
	}
}

browser.browserAction.onClicked.addListener((tab) => {
	windowManager(tab.windowId);
});

browser.commands.onCommand.addListener(function(command) {
	if (command == "toggle") {
		windowManager(3);
	}
});

function windowsOnRemoved(windowId){
	for (var i = 0; i < slideshowWindows.length; i++) {
		if (slideshowWindows[i].id == windowId) {
			slideshowWindows.splice(i, 1);
			i = i - 1;
		}
	}
	if (slideshowWindows.length == 0 && t != null) {
		t = clearInterval(t);
		browser.windows.onRemoved.removeListener(windowsOnRemoved);
	}
}

browser.storage.local.get(defaults, (options) => {
	interval = options.interval;
	order = options.order;
	reload = options.reload;
	automaticallyStart = options.automaticallyStart;
	if(automaticallyStart){
		browser.windows.onCreated.addListener(windowsOnCreated);
		browser.windows.getAll({}, (windows) => {
			for (var window of windows) {
				windowManager(window.id);
			}
		});
	}else{
		browser.windows.onCreated.removeListener(windowsOnCreated);
	}
});

browser.runtime.onMessage.addListener((message) => {
    if(message.interval != null){
        interval = message.interval;
    }
    if(message.order != null){
        order = message.order;
	}
	if(message.reload != null){
        reload = message.reload;
	}
	if(message.automaticallyStart != null){
		automaticallyStart = message.automaticallyStart;
		if(automaticallyStart){
			browser.windows.onCreated.addListener(windowsOnCreated);
		}else{
			browser.windows.onCreated.removeListener(windowsOnCreated);
		}
    }
});

function windowManager(windowId){
	browser.windows.getAll({}, (windows) => {
		var allWindowIds = new Array();
		for (var window of windows) {
			allWindowIds.push(window.id);
		}
		for (var i = 0; i < slideshowWindows.length; i++) {
			if (allWindowIds.indexOf(slideshowWindows[i].id) == -1) {
				slideshowWindows.splice(i, 1);
				i = i - 1;
			}
		}
		if (containsSlideshowWindowId(windowId)) {
			for (var i = 0; i < slideshowWindows.length; i++) {
				if (slideshowWindows[i].id == windowId) {
					slideshowWindows.splice(i, 1);
					i = i - 1;
				}
			}
		} else {
			slideshowWindows.push(new slideshowWindow(windowId));
		}
		setWindowIconTitle(windowId);
		if (slideshowWindows.length == 0 && t != null) {
			t = clearInterval(t);
			browser.windows.onRemoved.removeListener(windowsOnRemoved);
		}else if (slideshowWindows.length != 0 && t == null) {
			t = setInterval(timer, 1000);
			browser.windows.onRemoved.addListener(windowsOnRemoved);
		}
	});
}

function windowsOnCreated(window){
	if (automaticallyStart){
		windowManager(window.id);
	}
}
