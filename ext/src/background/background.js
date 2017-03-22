
var tabsData = {},
    FIGURES = [];

chrome.storage.local.get('rfFigures', function (data) {
    FIGURES = data.rfFigures || [];
});

chrome.storage.local.get('userInfo', function (data) {
    data.userInfo && data.userInfo.Token ? createContextMenus() : removeContextMenus();
});

function updateBrowserAction(tab) {
    if (isTabToProceed(tab)) {
        var t = tabsData[tab.id];
        //TODO change icon accordingly status and number of found figures
        if (t.status === _gConst.STATUS_NEW) {
            chrome.browserAction.setBadgeText({tabId: tab.id, text: ''});
        } else if (t.status === _gConst.STATUS_INPROCESS) {
            chrome.browserAction.setBadgeText({tabId: tab.id, text: 'L'});
        } else {
            if (t.count === -1) {
                // an error occurred while search figures
                chrome.browserAction.setBadgeText({tabId: tab.id, text: 'E'});
            } else if (t.count === 0) {
                // no figures found on the page
                chrome.browserAction.setBadgeText({tabId: tab.id, text: '0'});
            } else {
                // found figures on the page
                chrome.browserAction.setBadgeText({tabId: tab.id, text: String(t.count)});
            }
        }
    } else {
        // an empty or service tab
        chrome.browserAction.setBadgeText({tabId: tab.id, text: ''});
    }
}

function isTabToProceed(tab) {
    return tab.url && tab.url.indexOf('http') === 0;
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
        if (request.type === _gConst.MSG_TYPE_USER_LOGGED_IN) {
            createContextMenus();
        }
        if (request.type === _gConst.MSG_TYPE_USER_LOGGED_OUT) {
            removeContextMenus();
        }
        return true;
    }

);

function onSearchFiguresComplete(result, tab) {
    var t = tabsData[tab.id];
    if (t) {
        t.status = _gConst.STATUS_COMPLETE;
        t.count = result.count;
        t.figures = result.figures;
        chrome.storage.local.set({
            rfFigures: result.figures
        });
        FIGURES = result.figures;
        // to make sure the browserAction is enabled finally
        chrome.browserAction.enable(tab.id);
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
        url: '',
        figures: []
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

/*
 Called when the context menu item has been created, or when creation failed due to an error.
 We'll just log success/failure here.
 */
function onCreated() {
    if (chrome.runtime.lastError) {
        onError(chrome.runtime.lastError);
    } else {
        console.log("Item created successfully");
    }
}

function onError(error) {
    console.error("Error: ", error);
}

function createContextMenus() {
    /*
     Create all the context menu items.
     */
    var createCollectionItemOptions = {
            id: "create-collection",
            title: "Create Collection",
            contexts: ["image"]},

        addToExistingItemOptions = {
            id: "add-to-existing",
            title: "Add to existing",
            contexts: ["image"]
        };
    chrome.contextMenus.create(createCollectionItemOptions, onCreated);
    chrome.contextMenus.create(addToExistingItemOptions, onCreated);

    chrome.contextMenus.onClicked.addListener(contextMenuClickListener);
}

function removeContextMenus() {
    if (chrome.contextMenus.onClicked.hasListener(contextMenuClickListener)) {
        chrome.contextMenus.onClicked.removeListener(contextMenuClickListener);
    }
    chrome.contextMenus.removeAll();
}

function contextMenuClickListener(info, tab) {
    switch (info.menuItemId) {
        case "create-collection":
            console.log("Create Collection");
            console.log("Image URL: ", info.srcUrl);
            break;
        case "add-to-existing":
            console.log("Add to existing");
            addToSelected(info.srcUrl);
            break;
    }
}

function addToSelected(src) {
    var img = FIGURES.find(function (el) {
        return el.URL === src;
    });
    if(!img){
        alert(_gConst.POPUP_ERROR_FIG_NOT_PARSED);
    }else{
        chrome.storage.local.get('rfSelected', function (data) {
            var selected = data.rfSelected || [];
            var isDup = selected.find(function (el) {
                return el.URL === src;
            });
            if (isDup) {
                alert(_gConst.POPUP_ERROR_FIG_DUPLICATE);
            }else{
                selected.push(img);
                chrome.storage.local.set({
                    rfSelected: selected
                });
                chrome.runtime.sendMessage({
                    type: _gConst.MSG_TYPE_ADD_COMPLETED,
                    src: src
                });
            }
        });
    }
}