/**
 * Module routing
 */
(function (angular) {
    'use strict';

    angular
        .module('refigureApp')
        .run(appRun);

    var states = [{
        state: 'some-file-to-donwload',
        config: {
            url: '//cdn.refigure.org/somefile.pdf'
        }
    }];

    appRun.$inject = [
        '$rootScope',
        'routerHelper',
        'auth'
    ];

    function appRun($rootScope, routerHelper, auth) {

        routerHelper.trailingSlash();
        routerHelper.configureStates(getStates(), '/');
        $rootScope.$on('$stateChangeStart', stateChangeStart);

        //////////////////////

        function stateChangeStart(event, toState, toParams, fromState, fromParams) {
            if (!auth.isAuthenticated() && auth.isPrivateUrl(toState) && !auth.isAuthUrl(toState)) {
                auth.saveAndSign(toState, toParams);
                event.preventDefault();
                return false;
            }
            return true;
        }

        function getStates() {
            return states;
        }
    }
})(window.angular);
