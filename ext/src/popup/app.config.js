(function (angular) {
    'use strict';

    angular.module('ReFigure')
        .constant('STORAGE', {
            currentTab: null,
            rfFigures: null,
            foundFigures: null,
            Metapublication: null,
            userInfo: {}
        })
        .run(RunController);
    RunController.$inject = ['$rootScope', 'STORAGE'];

    function RunController($rootScope, STORAGE) {
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
