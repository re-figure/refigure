/**
 * Module routing
 */
(function (angular) {
    'use strict';

    angular
        .module('refigureApp')
        .run(appRun);

    var states = [{
        state: 'home',
        config: {
            url: '/',
            template: '<home-page></home-page>',
            data: {
                menuTitle: 'Home'
            }
        }
    }, {
        state: 'about',
        config: {
            url: '/about',
            template: '<about-page></about-page>',
            data: {
                menuTitle: 'About'
            }
        }
    }, {
        state: 'news',
        config: {
            url: '/news',
            template: '<news-page></news-page>',
            data: {
                menuTitle: 'News'
            }
        }
    }, {
        state: 'search-results',
        config: {
            url: '/search-results?term',
            template: '<search-results-page></search-results-page>',
            data: {
                menuTitle: 'Results'
            }
        }
    }, {
        state: 'some-file-to-donwload',
        config: {
            url: '//cdn.refigure.com/somefile.pdf'
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
