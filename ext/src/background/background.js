var tabsData = {}, noop = function () {};

var _user = {
    info: null,
    readStorage: function (cb) {
        cb = cb || noop;
        chrome.storage.local.get('userInfo', function (data) {
            if (data.userInfo) {
                _user.info = data.userInfo;
                return cb({data: data.userInfo});
            }
            cb({error: 1});
        });
    },
    clearStorage: function (cb) {
        this.info = null;
        chrome.storage.local.remove('userInfo', cb);
    },
    writeStorage: function (info, cb) {
        this.info = info;
        chrome.storage.local.set({
            userInfo: info
        }, function () {
            (cb || noop)({
                data: info
            });
        });
    },
    authUser: function (cb) {
        cb = cb || noop;
        // if already logged in
        if (this.info) {
            return cb({
                data: this.info
            });
        }
        //check chrome storage at first
        this.readStorage(function (res) {
            if (!res.error) {
                return cb(res);
            }

            //check if we have a jwt token
            chrome.cookies.get({
                url: _gConst.COOKIE.URL,
                name: _gConst.COOKIE.NAME
            }, function (cookie) {
                if (cookie && cookie.value) {
                    var _params = {url: 'userinfo', headers: {}};
                    _params.headers[_gConst.COOKIE.NAME] = cookie.value;
                    ajax(_params).then(function (res) {
                        _user.writeStorage(res.data);
                        cb(res);
                    }, function () {
                        cb({error: 1});
                    });
                } else {
                    cb({error: 1});
                }
            });
        });
    }
};

//identify user
_user.authUser(function (res) {
    if (!res.error) {
        setUninstallURL(res.data.Email);
    }
});

// Ensure the current selected tab is set up.
chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
    update(tabs[0].id);
});

chrome.runtime.onInstalled.addListener(onInstalled);

function onInstalled(details) {
    if (details.reason === 'install') {
        console.log('EXTENSION INSTALLED SUCCESSFULLY', details);
        _user.authUser(function (res) {
            if (!res.error) {
                return sendInstallNotifications(res.data);
            }
            chrome.identity.getProfileUserInfo(function(userInfo) {
                if (userInfo.email) {
                    userInfo.source = _gConst.EXTENSION_USER_SOURCE_GOOGLE;
                    sendInstallNotifications(userInfo);
                } else {
                    if (_gConst.ON_INSTALL.FORCE_AUTH) {
                        chrome.identity.getAuthToken({interactive: true}, function(token) {
                            ajax({
                                url: 'https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=' + token
                            }).then(function (resp) {
                                resp.source = _gConst.EXTENSION_USER_SOURCE_GOOGLE;
                                sendInstallNotifications(resp);
                            });
                        });
                    }
                }
            });

            function sendInstallNotifications(user) {
                setUninstallURL(user.Email || user.email);
                if (_gConst.ON_INSTALL.LOG || _gConst.ON_INSTALL.EMAIL) {
                    ajax({
                        type: 'POST',
                        url: 'downloads',
                        data: {
                            DateRemoved: null,
                            Data: user
                        }
                    });
                }
            }
        });
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
            _user.writeStorage(request.user);
            setUninstallURL(request.user.Email);
            break;
        case _gConst.MSG_TYPE_USER_LOGGED_OUT_ON_SITE:
            _user.clearStorage();
            break;
        case _gConst.MSG_TYPE_IS_EXTENSION_INSTALLED:
            callback({success: true});
            break;
    }
});

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
        return str.replace(/[\-\[\]\/{}()+?.\\^$|]/g, '\\$&').replace(/\*/g, '.*');
    }
}

function ajax(params) {
    var requestParams = Object.assign({
        url: '',
        type: 'GET',
        data: {},
        headers: {}
    }, params);

    return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.onload = function () {
            try {
                resolve(JSON.parse(xhr.response));
            } catch (e) {
                console.log(e);
                reject({
                    error: 1,
                    message: 'Failed to parse JSON'
                });
            }
        };

        xhr.onerror = function () {
            console.log(xhr.response);
            reject(xhr.response);
        };
        var url = requestParams.url.indexOf('http') === 0 ? requestParams.url : _gApiURL + requestParams.url;
        xhr.open(requestParams.type, url);
        xhr.setRequestHeader('Content-Type', 'application/json');

        Object.keys(requestParams.headers).forEach(function (key) {
            xhr.setRequestHeader(key, requestParams.headers[key]);
        });
        xhr.send(requestParams.data ? JSON.stringify(requestParams.data) : null);
    });
}

function setUninstallURL(email) {
    chrome.runtime.setUninstallURL(_gConst.COOKIE.URL + '#action=uninstall&email=' + email);
}
