
var tabsData = {};


function updateBrowserAction(tab) {
    if (isTabToProceed(tab)) {
        var t = tabsData[tab.id];
        if (t.status === _gConst.STATUS_NEW) {
            chrome.browserAction.setBadgeText({tabId: tab.id, text: ''});
        } else if (t.status === _gConst.STATUS_INPROCESS) {
            chrome.browserAction.setBadgeText({tabId: tab.id, text: 'L'});
        } else {
            chrome.browserAction.setBadgeText({tabId: tab.id, text: String(t.count)});
        }
    } else {
        // an empty or service tab
        chrome.browserAction.setBadgeText({tabId: tab.id, text: ''});
    }
}

function isTabToProceed(tab) {
    if (tab.url && tab.url.indexOf('http') === 0) {
        return true;
    }
    return false;
}

function startSearchFiguresIfNeed(tab) {
    if (isTabToProceed(tab)) {
        var t = tabsData[tab.id];
        if (t.url !== tab.url) {
            // the tab URL has changed, so start search figures
            t.status = _gConst.STATUS_INPROCESS;
            t.url = tab.url;
            chrome.tabs.sendMessage(tab.id, {type: _gConst.MSG_TYPE_START_SEARCH});
        }
    }
}

chrome.runtime.onMessage.addListener(

    function(request, sender, sendResponse) {
        if (sender.tab && request.type === _gConst.MSG_TYPE_SEARCH_COMPLETED) {
            onSearchFiguresComplete(request, sender.tab);
        }
        return true;
    }

);

function onSearchFiguresComplete(result, tab) {
    var t = tabsData[tab.id];
    if (t) {
        t.status = _gConst.STATUS_COMPLETE;
        t.count = result.count;
        update(tab.id);
    }
}

function update(tabId) {
    chrome.tabs.get(tabId, function(tab) {
        startSearchFiguresIfNeed(tab);
        updateBrowserAction(tab);
    });
}

function createNewTabData(tabId) {
    tabsData[tabId] = {
        status: 0,
        count: 0,
        url: ''
    };
}

chrome.tabs.onCreated.addListener(function(tab) {
    createNewTabData(tab.id);
    update(tab.id);
});

chrome.tabs.onUpdated.addListener(function(tabId, change, tab) {
    if (change.status === 'complete') {
        if (change.url === undefined) {
            // reload the current page
            createNewTabData(tabId);
        }
        chrome.browserAction.enable(tabId);
        update(tabId);
    } else {
        chrome.browserAction.disable(tabId);
    }
});

chrome.tabs.onActivated.addListener(function (activeInfo) {
    update(activeInfo.tabId);
});

chrome.tabs.onReplaced.addListener(function(addedTabId, removedTabId) {
    var t = tabsData[removedTabId];
    if (t) {
        tabsData[addedTabId] = t;
        delete tabsData[removedTabId];
    }
});

// Ensure the current selected tab is set up.
chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    update(tabs[0].id);
});
