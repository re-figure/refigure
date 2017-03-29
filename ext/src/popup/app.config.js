(function (angular) {
    'use strict';

    angular.module('ReFigure')
        .constant('STORAGE', {
            CURRENT_TAB: null,
            FIGURES: [],
            FOUND_FIGURES: [],
            CURRENT_METAPUBLICATION: null
        })
        .config(ConfigController)
        .run(RunController);

    ConfigController.$inject = ['STORAGE', '$compileProvider'];

    function ConfigController(STORAGE, $compileProvider) {
        chrome.storage.local.get('rfFigures', function (data) {
            STORAGE.FIGURES = data.rfFigures || [];
        });

        chrome.storage.local.get('Metapublication', function (data) {
            STORAGE.CURRENT_METAPUBLICATION = data.Metapublication || null;
            console.log("ddddd: ", data);
        });

        chrome.tabs.query({
            active: true,
            currentWindow: true
        }, function (res) {
            STORAGE.CURRENT_TAB = res[0].id;
            //send message to force content's edit dialog close
            chrome.tabs.sendMessage(STORAGE.CURRENT_TAB, {
                type: _gConst.MSG_TYPE_POPUP_OPENED
            });

            //send to BG
            chrome.runtime.sendMessage({
                type: _gConst.MSG_TYPE_GET_FOUND_FIGURES,
                tabId: STORAGE.CURRENT_TAB
            }, function (resp) {
                // console.log("Got foundFigures response: ", resp.foundFigures);
                STORAGE.FOUND_FIGURES = resp.foundFigures || [];
            });
        });

        chrome.storage.local.get('foundFigures', function (data) {
            STORAGE.FOUND_FIGURES = data.foundFigures || [];
        });

        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension):/);
    }

    RunController.$inject = ['$rootScope', 'STORAGE'];

    function RunController($rootScope, STORAGE) {
        chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
                if (sender.tab && request.type === _gConst.MSG_TYPE_SEARCH_COMPLETED) {
                    $rootScope.$apply(function () {
                        STORAGE.FIGURES = request.figures;
                    });
                } else if (sender.tab && request.type === _gConst.MSG_TYPE_CHECK_COMPLETED) {
                    $rootScope.$apply(function () {
                        STORAGE.FOUND_FIGURES = request.figures;
                    });
                }
                return true;
            }
        );
    }

})(window.angular);