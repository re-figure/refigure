/**
 * Module routing
 */
(function (angular) {
    'use strict';

    angular
        .module('refigureAuth')
        .run(appRun);

    var states = [{
        state: 'signin',
        config: {
            url: '/signin',
            template: '<sign-in></sign-in>',
            data: {
                auth: true
            }
        }
    }, {
        state: 'signup',
        config: {
            url: '/signup/:hash?',
            template: '<sign-up></sign-up>',
            data: {
                auth: true
            }
        }
    }, {
        state: 'pwdreset',
        config: {
            url: '/passwordreset/:hash?',
            template: '<password-reset></password-reset>',
            data: {
                auth: true
            }
        }
    }, {
        state: 'pwdset',
        config: {
            url: '/passwordset/:hash',
            template: '<password-reset></password-reset>',
            data: {
                auth: true
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
