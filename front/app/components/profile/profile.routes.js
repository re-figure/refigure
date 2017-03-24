/**
 * Module routing
 */
(function (angular) {
    'use strict';

    angular
        .module('refigureProfile')
        .run(appRun);

    var states = [{
        state: 'profile',
        config: {
            url: '/profile',
            template: '<account-setting></account-setting>',
            data: {
                private: true
            }
        }
    }];

    appRun.$inject = [
        'routerHelper'
    ];

    function appRun(routerHelper) {

        routerHelper.trailingSlash();
        routerHelper.configureStates(getStates(), '/');

        //////////////////////

        function getStates() {
            return states;
        }
    }
})(window.angular);
