(function (angular) {
    'use strict';

    angular
        .module('refigureApp', [
            // libs
            'ui.router',
            'ngSanitize',
            'ngMaterial',
            'router.helper',
            'ui.ap.auto-focus',
            'dibari.angular-ellipsis',
            'angularUtils.directives.dirDisqus',
            // custom modules
            'refigureAuth',
            'refigureProfile',
            'refigureShared'
        ])
        .constant('MESSAGES', {
            MSG_TYPE_REFIGURE_IMAGES_COLLECTED: 100,
            MSG_TYPE_USER_LOGGED_IN_ON_SITE: 41,
            MSG_TYPE_USER_LOGGED_OUT_ON_SITE: 51,
            MSG_TYPE_IS_EXTENSION_INSTALLED: 120
        })
        .constant('CONST', {
            extensionId: 'EXTENSION_ID',
            parseRefigureSite: 'PARSE_REFIGURE_SITE',
            disqusShortName: 'DISQUS_SHORT_NAME'
        })
        .config(appConfig)
        .config(themeConfig)
        .run(appRun);

    appConfig.$inject = [
        '$httpProvider',
        '$locationProvider'
    ];

    function appConfig($httpProvider, $locationProvider) {
        $locationProvider.html5Mode(true);
        $httpProvider.interceptors.push('authInterceptor');
        $httpProvider.interceptors.push('authErrorInterceptor');
        $httpProvider.interceptors.push('errorInterceptor');
    }

    appRun.$inject = [
        '$rootScope',
        'auth'
    ];

    function appRun($rootScope, auth) {
        $rootScope.projectName = 'Refigure';
        $rootScope.mobileBrowser = utils.mobileBrowser();
        if (auth.isAuthenticated()) {
            auth.usrInfo();
        }
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
