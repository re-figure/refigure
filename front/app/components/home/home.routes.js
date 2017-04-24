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
            url: '/search-results?{from:int}&query&{size:int}&sortDirection&sortField',
            reloadOnSearch: false,
            template: '<search-results></search-results>',
            data: {
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
        state: 'home.news',
        config: {
            url: '/news',
            template: '<news></news>',
            data: {
                label: 'News',
                description: 'The latest news'
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
