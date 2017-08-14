var tabsData = {},
    contextMenu = {};

chrome.storage.local.get('userInfo', function (data) {
    if (data.userInfo) {
        contextMenu.isSignedIn = true;
        contextMenu.create();
    } else {
        contextMenu.isSignedIn = false;
        contextMenu.remove();
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
                        contextMenu.isActionEnabled = true;
                        contextMenu.create();
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
            contextMenu.isActionEnabled = true;
            contextMenu.create();
        }
        if (request.type === _gConst.MSG_TYPE_USER_LOGGED_IN) {
            contextMenu.isSignedIn = true;
            contextMenu.create();
        }
        if (request.type === _gConst.MSG_TYPE_USER_LOGGED_OUT) {
            contextMenu.isSignedIn = false;
            contextMenu.remove();
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

chrome.runtime.onMessageExternal.addListener(function (request, sender, callback) {
    switch (request.type) {
        case _gConst.MSG_TYPE_USER_LOGGED_IN_ON_SITE:
            chrome.storage.local.set({
                userInfo: request.user
            });
            break;
        case _gConst.MSG_TYPE_USER_LOGGED_OUT_ON_SITE:
            chrome.storage.local.remove('userInfo');
            break;
        case _gConst.MSG_TYPE_IS_EXTENSION_INSTALLED:
            callback({success: true});
            break;
    }
});

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
        contextMenu.isActionEnabled = false;
        contextMenu.remove();
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

contextMenu = {
    isSignedIn: false,
    isActionEnabled: false,
    create: function () {
        return false;
        if (contextMenu.isSignedIn && contextMenu.isActionEnabled) {
            var addToExistingItemOptions = {
                id: 'add-to-existing',
                title: 'Add image to Refigure',
                contexts: ['image']
            };
            chrome.contextMenus.create(addToExistingItemOptions, contextMenu.onCreated);
            chrome.contextMenus.onClicked.addListener(contextMenu.onClick);
        }
    },
    remove: function () {
        if (chrome.contextMenus.onClicked.hasListener(contextMenu.onClick)) {
            chrome.contextMenus.onClicked.removeListener(contextMenu.onClick);
        }
        chrome.contextMenus.removeAll(function () {
            console.log('Refigure context menu: removed');
        });
    },
    onClick: function (info, tab) {
        switch (info.menuItemId) {
            case 'add-to-existing':
                console.log('Adding an image to the current Refigure');
                chrome.tabs.sendMessage(tab.id, {
                    type: _gConst.MSG_TYPE_ADD_FIGURE_TO_COLLECTION,
                    src: info.srcUrl
                });
                break;
        }
    },
    onCreated: function () {
        if (chrome.runtime.lastError) {
            console.error('Refigure context menu: error: ', chrome.runtime.lastError);
        } else {
            console.log('Refigure context menu: created successfully');
        }
    }
};

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
