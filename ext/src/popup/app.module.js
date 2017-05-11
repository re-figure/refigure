(function (angular) {
    'use strict';

    var _store = {};
    var promises = [];

    promises.push(new Promise(function (resolve) {
        chrome.storage.local.get(null, function (data) {
            angular.extend(_store, data);
            resolve();
        });
    }));

    promises.push(new Promise(function (resolve) {
        chrome.tabs.query({
            active: true,
            currentWindow: true
        }, function (res) {
            _store.currentTab = res[0].id;
            //send message to force content's edit dialog close
            chrome.tabs.sendMessage(_store.currentTab, {
                type: _gConst.MSG_TYPE_POPUP_OPENED
            });

            //send to BG
            chrome.runtime.sendMessage({
                type: _gConst.MSG_TYPE_GET_FOUND_FIGURES,
                tabId: _store.currentTab
            }, function (resp) {
                _store.inMetapublications = resp && resp.inMetapublications ? resp.inMetapublications : [];
                _store.foundFigures = resp && resp.foundFigures ? resp.foundFigures : [];
                resolve();
            });
        });
    }));

    Promise.all(promises).then(function () {
        angular.bootstrap(document, ['ReFigure'], {strictDi: true});
    });

    angular.module('ReFigure', ['ngRoute', 'ngSanitize'])
        .constant('CookieToken', {
            COOKIE_DOMAIN: 'https://refigure.noblecoz.com',
            COOKIE_NAME: 'Authentication',
            set: function (token) {
                chrome.cookies.set({
                    url: this.COOKIE_DOMAIN,
                    name: this.COOKIE_NAME,
                    value: token
                }, function () {
                    if (chrome.extension.lastError) {
                        console.error(chrome.extension.lastError);
                    }
                    if (chrome.runtime.lastError) {
                        console.error(chrome.runtime.lastError);
                    }
                });
            },
            remove: function () {
                chrome.cookies.set({
                    name: this.COOKIE_NAME,
                    url: this.COOKIE_DOMAIN
                }, function (cookie) {
                    console.log('cookie removed', cookie);
                });
            }
        })
        .constant('STORAGE', {
            currentTab: null,
            rfFigures: null,
            foundFigures: null,
            Metapublication: null,
            inMetapublications: [],
            userInfo: {}
        })
        .config(ConfigController)
        .run(RunController);

    ConfigController.$inject = ['$httpProvider', '$compileProvider', 'STORAGE', 'CookieToken'];

    function ConfigController($httpProvider, $compileProvider, STORAGE, CookieToken) {
        angular.extend(STORAGE, _store);
        if (STORAGE.userInfo.ID) {
            CookieToken.set(STORAGE.userInfo.Token);
        }
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension):/);
        $compileProvider.debugInfoEnabled(false);
        $httpProvider.interceptors.push(['$q', 'MessageService', function ($q, MessageService) {
            return {
                'request': function (config) {
                    MessageService.loader = true;
                    return config;
                },

                'response': function (response) {
                    MessageService.loader = false;
                    return response;
                },

                'responseError': function (rejection) {
                    var message = 'Something went wrong. Please try again later';
                    if (rejection.data) {
                        message = rejection.data.message;
                    }
                    console.info(rejection);
                    MessageService.showMessage({
                        text: message,
                        type: 'warning'
                    });
                    MessageService.loader = false;
                    return $q.reject(rejection);
                }
            };
        }]);
    }

    RunController.$inject = ['$rootScope', 'STORAGE'];

    function RunController($rootScope, STORAGE) {
        $rootScope.$on('$routeChangeSuccess', function ($event, $curr) {
            document.body.className = 'rf-route-' + $curr.$$route.config.name;
        });
        chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
                if (sender.tab && request.type === _gConst.MSG_TYPE_SEARCH_COMPLETED) {
                    $rootScope.$apply(function () {
                        STORAGE.rfFigures = request.figures;
                    });
                } else if (sender.tab && request.type === _gConst.MSG_TYPE_CHECK_COMPLETED) {
                    $rootScope.$apply(function () {
                        STORAGE.foundFigures = request.figures;
                        STORAGE.inMetapublications = request.inMetapublications;
                    });
                }
                return true;
            }
        );
    }

})(window.angular);
