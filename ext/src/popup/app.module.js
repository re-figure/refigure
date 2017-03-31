//fixme: debug page chrome-extension://eomljbidagegcimpgnpmmejnjbcfpdgo/popup/popup.html
//fixme: link to page where figure exists in database http://journals.plos.org/plosntds/article?id=10.1371/journal.pntd.0003013

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
                _store.foundFigures = resp && resp.foundFigures ? resp.foundFigures : [];
                resolve();
            });
        });
    }));

    Promise.all(promises).then(function () {
        angular.bootstrap(document, ['ReFigure'], {strictDi: true})
    });

    angular.module('ReFigure', ['ngRoute', 'ngSanitize'])
        .constant('STORAGE', {
            currentTab: null,
            rfFigures: null,
            foundFigures: null,
            Metapublication: null,
            userInfo: {}
        })
        .config(ConfigController)
        .run(RunController);

    ConfigController.$inject = ['$httpProvider', '$compileProvider', 'STORAGE'];

    function ConfigController($httpProvider, $compileProvider, STORAGE) {
        angular.extend(STORAGE, _store);
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension):/);

        $httpProvider.interceptors.push(['$q', 'MessageService', function ($q, MessageService) {
            return {
                'request': function(config) {
                    console.log('request');
                    MessageService.loader = true;
                    return config;
                },

                'response': function(response) {
                    MessageService.loader = false;
                    return response;
                },

                'responseError': function(rejection) {
                    console.info(rejection);
                    MessageService.showMessage({
                        text: rejection.data && rejection.data.message || 'Something went wrong. Please try again later',
                        type: 'warning'
                    });
                    MessageService.loader = false;
                    return $q.reject(rejection);
                }
            }
        }]);
    }

    RunController.$inject = ['$rootScope', 'STORAGE'];

    function RunController($rootScope, STORAGE) {
        $rootScope.$on('$routeChangeSuccess', function ($event, $curr) {
            document.body.className = 'rf-route-' + $curr.$$route.config.name
        });
        chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
                if (sender.tab && request.type === _gConst.MSG_TYPE_SEARCH_COMPLETED) {
                    $rootScope.$apply(function () {
                        STORAGE.rfFigures = request.figures;
                    });
                } else if (sender.tab && request.type === _gConst.MSG_TYPE_CHECK_COMPLETED) {
                    $rootScope.$apply(function () {
                        STORAGE.foundFigures = request.figures;
                    });
                }
                return true;
            }
        );
    }

})(window.angular);
