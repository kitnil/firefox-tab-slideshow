document.addEventListener('DOMContentLoaded',　() => {
	var defaults = {
		interval: 15,
		order: "forward",
		reload: false,
		automaticallyStart: false
	}

	document.getElementById("intervalText").innerText = browser.i18n.getMessage("interval");
	document.getElementById("secondsText").innerText = browser.i18n.getMessage("seconds");
	document.getElementById("orderText").innerText = browser.i18n.getMessage("orderText");
	document.getElementById("forward").text = browser.i18n.getMessage("forward");
	document.getElementById("reverse").text = browser.i18n.getMessage("reverse");
	document.getElementById("random").text = browser.i18n.getMessage("random");
	document.getElementById("reloadText").innerText = browser.i18n.getMessage("reloadText");
	document.getElementById("automaticallyStartText").innerText = browser.i18n.getMessage("automaticallyStartText");

	browser.storage.local.get(defaults, (options) => {
		document.getElementById("interval").value = options.interval;
		document.getElementById("interval").addEventListener("change", () => {
			if (1 <= document.getElementById("interval").value){
				browser.storage.local.set({interval: document.getElementById("interval").value});
				browser.runtime.sendMessage({interval: document.getElementById("interval").value});
			}
		});

		document.getElementById("order").value = options.order;
		document.getElementById("order").addEventListener("change", () => {
			if (document.getElementById("order").value == "forward"
			||document.getElementById("order").value == "reverse"
			||document.getElementById("order").value == "random"){
				browser.storage.local.set({order: document.getElementById("order").value});
				browser.runtime.sendMessage({order: document.getElementById("order").value});
			}
		});

		document.getElementById("reload").checked = options.reload;
		document.getElementById("reload").addEventListener("change", () => {
			browser.storage.local.set({reload: document.getElementById("reload").checked});
			browser.runtime.sendMessage({reload: document.getElementById("reload").checked});
		});

		document.getElementById("automaticallyStart").checked = options.automaticallyStart;
		document.getElementById("automaticallyStart").addEventListener("change", () => {
			browser.storage.local.set({automaticallyStart: document.getElementById("automaticallyStart").checked});
			browser.runtime.sendMessage({automaticallyStart: document.getElementById("automaticallyStart").checked});
		});
	});
});