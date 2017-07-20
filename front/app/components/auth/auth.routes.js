/**
 * Module routing
 */
(function (angular) {
    'use strict';

    angular
        .module('refigureAuth')
        .run(appRun);

    var states = [{
        state: 'auth.signin',
        config: {
            url: '/signin',
            template: '<sign-in></sign-in>',
            data: {
                auth: true
            }
        }
    }, {
        state: 'auth.signup',
        config: {
            url: '/signup/:hash',
            params:  {
                hash: {
                    value: null,
                    squash: true
                }
            },
            template: '<sign-up></sign-up>',
            data: {
                auth: true
            }
        }
    }, {
        state: 'auth.pwdreset',
        config: {
            url: '/passwordreset/:hash',
            params:  {
                hash: {
                    value: null,
                    squash: true
                }
            },
            template: '<password-reset></password-reset>',
            data: {
                auth: true
            }
        }
    }, {
        state: 'auth.pwdset',
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
            return [{
                state: 'auth',
                config: {
                    abstract: true,
                    templateUrl: 'view/authPage.html'
                }
            }]
                .concat(states);
        }
    }
})(window.angular);
