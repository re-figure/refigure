/**
 * Module routing
 */
(function (angular) {
    'use strict';

    angular
        .module('refigureProfile')
        .run(appRun);

    var states = [{
        state: 'profile.collections',
        config: {
            url: '/collections?refigure',
            template: '<my-collections></my-collections>',
            reloadOnSearch: false,
            data: {
                private: true,
                label: 'My refigures',
                description: 'Refigures management'
            }
        }
    }, {
        state: 'profile.account',
        config: {
            url: '/account',
            template: '<account-settings></account-settings>',
            data: {
                private: true,
                label: 'My account',
                description: 'Account setting'
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
                state: 'profile',
                config: {
                    // abstract: true,
                    url: '/profile',
                    redirectTo: 'profile.collections',
                    template: '<profile-page class="r-page r-profile-page" layout="row"></profile-page>'
                }
            }]
                .concat(states);
        }
    }
})(window.angular);
