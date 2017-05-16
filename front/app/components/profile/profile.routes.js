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
            url: '/collections?{from:int}&query&{size:int}&sortDirection&sortField',
            template: '<collections-management></collections-management>',
            reloadOnSearch: false,
            data: {
                private: true,
                label: 'Refigures',
                description: 'Refigures management'
            }
        }
    }, {
        state: 'profile.myCollections',
        config: {
            url: '/my-collections?{from:int}&query&{size:int}&sortDirection&sortField',
            template: '<my-collections></my-collections>',
            reloadOnSearch: false,
            data: {
                private: true,
                label: 'My refigures',
                description: 'My refigures management'
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
    }, {
        state: 'profile.dashboard',
        config: {
            url: '/dashboard',
            template: '<dashboard></dashboard>',
            data: {
                private: true,
                label: 'Dashboard',
                description: 'Refigures summarized information'
            }
        }
    }, {
        state: 'profile.users',
        config: {
            url: '/users-list?user&{from:int}&{size:int}',
            template: '<users-list></users-list>',
            reloadOnSearch: false,
            data: {
                private: true,
                label: 'Users',
                description: 'Manage users'
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
                    //redirectTo: 'profile.collections',
                    template: '<profile-page class="r-page r-profile-page" layout="row"></profile-page>',
                    data: {
                        private: true
                    }
                }
            }]
                .concat(states);
        }
    }
})(window.angular);
