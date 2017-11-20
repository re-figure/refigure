/**
 * Module routing
 */
(function (angular) {
    'use strict';

    angular
        .module('refigureApp')
        .run(appRun);

    var states = [{
        state: 'home.search',
        config: {
            url: '/',
            template: '<search></search>',
            data: {
                label: 'Home',
                description: 'Home page'
            }
        }
    }, {
        state: 'home.search-results',
        config: {
            url: '/search-results?{from:int}&query&{size:int}&sortDirection&sortField&{Flagged:int}&queryField',
            reloadOnSearch: false,
            template: '<search-results></search-results>',
            data: {
                headerTitle: 'Search results',
                menuTitle: 'Results'
            }
        }
    }, {
        state: 'home.about',
        config: {
            url: '/about',
            template: '<about></about>',
            data: {
                label: 'About',
                description: 'About project'
            }
        }
    }, {
        state: 'home.help',
        config: {
            url: '/help',
            template: '<help></help>',
            data: {
                headerTitle: 'Help',
                label: 'Help',
                description: 'Step-by-step help'
            }
        }
    }, {
        state: 'home.terms',
        config: {
            url: '/terms',
            template: '<terms></terms>',
            data: {
                label: 'Terms',
                description: 'Terms of service'
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
                state: 'home',
                config: {
                    abstract: true,
                    templateUrl: 'view/homePage.html'
                }
            }]
                .concat(states);
        }
    }
})(window.angular);
