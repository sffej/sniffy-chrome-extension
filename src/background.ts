class SniffyExtensionSettings {

    constructor(public active: boolean, public enabled: boolean, public injectHtmlEnabled: boolean) {

    }

}

function addSniffyHeaders(details: chrome.webRequest.WebRequestHeadersDetails) {
    details.requestHeaders.push({
        "name": "Sniffy-Enabled",
        "value": "true"
    });
    if (undefined === details.requestHeaders.find((httpHeader : chrome.webRequest.HttpHeader) => httpHeader.name === "Sniffy-Inject-Html-Enabled")) {
        details.requestHeaders.push({
            "name": "Sniffy-Inject-Html-Enabled",
            "value": "true"
        });
    }
    return {
        requestHeaders : details.requestHeaders
    };
}

chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.set(new SniffyExtensionSettings(true, true, true), updateListeners);
});

registerBrowserActionListener();
updateListeners();

function registerBrowserActionListener() {
    chrome.browserAction.onClicked.addListener((tab : chrome.tabs.Tab) => {
        chrome.storage.local.get((settings: SniffyExtensionSettings) => {
            settings.active = !settings.active;
            chrome.storage.local.set(settings, updateListeners);
        });
    });
}

function updateListeners() {
    chrome.storage.local.get((settings: SniffyExtensionSettings) => {

        chrome.webRequest.onBeforeSendHeaders.removeListener(addSniffyHeaders);

        if (settings.active) {

            chrome.browserAction.setIcon({path: "on.png"});

            chrome.webRequest.onBeforeSendHeaders.addListener(
                addSniffyHeaders,
                {
                    urls: ["<all_urls>"]
                },
                ["blocking", "requestHeaders"]
            );

        } else {
            chrome.browserAction.setIcon({path: "off.png"});
        }

    })
}