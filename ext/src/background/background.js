var tabsData = {};

chrome.storage.local.get('userInfo', function (data) {
    if (data.userInfo) {
        createContextMenus();
    } else {
        removeContextMenus();
    }
});

function updateBrowserAction(tab) {
    if (isTabToProceed(tab)) {
        var t = tabsData[tab.id];
        //TODO change icon accordingly status and number of found figures
        if (t) {
            t.badgeText = '';
            if (t.status === _gConst.STATUS_NEW) {
                t.badgeText = '';
            } else if (t.status === _gConst.STATUS_INPROCESS) {
                setTimeout(function () {
                    if (t.badgeText === '') {
                        chrome.browserAction.enable(tab.id);
                        chrome.browserAction.setBadgeText({tabId: tab.id, text: ''});
                    }
                }, 10000);
            } else {
                if (!t.foundFigures || t.foundFigures.length === 0) {
                    // no figures found on the page or an error occurred
                    t.badgeText = '0';
                } else {
                    // found figures on the page
                    t.badgeText = t.foundFigures.length + '/' + t.inMetapublications.length;
                }
            }
            chrome.browserAction.setBadgeText({tabId: tab.id, text: t.badgeText});
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
        if (t) {
            if (t.url && t.url !== tab.url) {
                // the tab URL has changed, so start search figures
                t.url = tab.url;
                if (getParseStatus(t.url)) {
                    t.status = _gConst.STATUS_INPROCESS;
                    chrome.tabs.sendMessage(tab.id, {type: _gConst.MSG_TYPE_START_SEARCH});
                }
            } else if (!t.url) {
                t.url = tab.url;
                if (getParseStatus(t.url)) {
                    t.status = _gConst.STATUS_INPROCESS;
                    chrome.tabs.sendMessage(tab.id, {type: _gConst.MSG_TYPE_START_SEARCH});
                }
            }
        }
    }
}

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (sender.tab && request.type === _gConst.MSG_TYPE_SEARCH_COMPLETED) {
            onParseFiguresComplete(request, sender.tab);
        }
        if (sender.tab && request.type === _gConst.MSG_TYPE_CHECK_COMPLETED) {
            chrome.browserAction.enable(sender.tab.id);
            onSearchFiguresComplete(request, sender.tab);
        }
        if (request.type === _gConst.MSG_TYPE_USER_LOGGED_IN) {
            createContextMenus();
        }
        if (request.type === _gConst.MSG_TYPE_USER_LOGGED_OUT) {
            removeContextMenus();
        }
        if (request.type === _gConst.MSG_TYPE_GET_FOUND_FIGURES) {
            sendResponse({
                foundFigures: tabsData[request.tabId].foundFigures,
                inMetapublications: tabsData[request.tabId].inMetapublications
            });
        }
        if (request.type === _gConst.MSG_TYPE_BADGE_NA) {
            chrome.browserAction.setBadgeText({tabId: sender.tab.id, text: 'n/a'});
        }
        return true;
    }
);

function onParseFiguresComplete(result, tab) {
    var t = tabsData[tab.id];
    if (t) {
        t.figures = result.figures;
    }
}

function onSearchFiguresComplete(result, tab) {
    var t = tabsData[tab.id];
    if (t) {
        t.status = _gConst.STATUS_COMPLETE;
        t.foundFigures = result.figures;
        t.inMetapublications = result.inMetapublications;
        update(tab.id);
    }
}

function update(tabId) {
    if (tabsData[tabId] && tabsData[tabId].status !== _gConst.STATUS_INPROCESS) {
        chrome.tabs.get(tabId, function (tab) {
            startSearchFiguresIfNeed(tab);
            updateBrowserAction(tab);
        });
    }
}

function createNewTabData(tabId) {
    tabsData[tabId] = {
        status: _gConst.STATUS_NEW,
        url: '',
        figures: [],
        foundFigures: []
    };
}

chrome.tabs.onCreated.addListener(function (tab) {
    console.log('created tab', tab.id);
    createNewTabData(tab.id);
    update(tab.id);
});

chrome.tabs.onUpdated.addListener(function (tabId, change, tab) {
    console.log('updated tab', tabId, tab.id);
    if (change.status === 'complete') {
        if (change.url === undefined) {
            // reload the current page
            createNewTabData(tabId);
        }
        update(tabId);
    } else {
        chrome.browserAction.disable(tabId);
    }
});

chrome.tabs.onActivated.addListener(function (activeInfo) {
    console.log('activated tab', activeInfo);
    update(activeInfo.tabId);
});

chrome.tabs.onReplaced.addListener(function (addedTabId, removedTabId) {
    console.log('replaced tab', addedTabId, removedTabId);
    var t = tabsData[removedTabId];
    if (t) {
        tabsData[addedTabId] = t;
        delete tabsData[removedTabId];
    }
});

// Ensure the current selected tab is set up.
chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
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
        console.log('Item created successfully');
    }
}

function onError(error) {
    console.error('Error: ', error);
}

function createContextMenus() {
    /*
     Create all the context menu items.
     */
    var addToExistingItemOptions = {
        id: 'add-to-existing',
        title: 'Add image to Refigure',
        contexts: ['image']
    };
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
        case 'add-to-existing':
            console.log('Add an image to the current Refigure');
            chrome.tabs.sendMessage(tab.id, {
                type: _gConst.MSG_TYPE_ADD_FIGURE_TO_COLLECTION,
                src: info.srcUrl
            });
            break;
    }
}

function getParseStatus(url) {
    if (_gConst.SETTINGS.parseAll) {
        return true;
    }
    var contentScripts = chrome.runtime.getManifest()['content_scripts'],
        match = false,
        reg;
    contentScripts.pop();
    contentScripts.forEach(function (el) {
        el.matches.forEach(function (regStr) {
            reg = new RegExp(escapeRegExp(regStr));
            if (url.match(reg)) {
                match  = true;
            }
        });
    });
    if (!match) {
        console.log('Refigure: Parser was turned off');
    }
    return match;

    function escapeRegExp(str) {
        return str.replace(/[\-\[\]\/\{\}\(\)\+\?\.\\\^\$\|]/g, '\\$&').replace(/\*/g, '.*');
    }
}