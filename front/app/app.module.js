(function(angular) {
    'use strict';

    angular
        .module('refigureApp', [
            // libs
            'ui.router',
            'ngSanitize',
            'ngMaterial',
            'router.helper',
            'ui.ap.auto-focus',
            // custom modules
            'refigureAuth',
            'refigureProfile',
            'refigureShared'
        ])
        .config(appConfig)
        .config(themeConfig)
        .run(appRun);

    appConfig.$inject = [
        '$httpProvider',
        '$locationProvider',
    ];

    function appConfig($httpProvider, $locationProvider) {
        $locationProvider.html5Mode(true);
        $httpProvider.interceptors.push('authInterceptor');
        $httpProvider.interceptors.push('authErrorInterceptor');
        $httpProvider.interceptors.push('errorInterceptor');
    }

    appRun.$inject = [
        '$rootScope'
    ];

    function appRun($rootScope) {
        $rootScope.projectName = 'ReFigure';
        $rootScope.mobileBrowser = utils.mobileBrowser();
    }

    themeConfig.$inject = [
        '$mdThemingProvider'
    ];

    function themeConfig($mdThemingProvider) {
        $mdThemingProvider.theme('default')
            .primaryPalette('blue-grey')
            .accentPalette('orange');
    }
})(window.angular);
