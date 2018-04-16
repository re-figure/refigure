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
            // custom modules
            'refigureAuth',
            'refigureProfile',
            'refigureShared',
            'angular-google-analytics'
        ])
        .constant('MESSAGES', {
            MSG_TYPE_REFIGURE_IMAGES_COLLECTED: 100,
            MSG_TYPE_USER_LOGGED_IN_ON_SITE: 41,
            MSG_TYPE_USER_LOGGED_OUT_ON_SITE: 51,
            MSG_TYPE_IS_EXTENSION_INSTALLED: 120
        })
        .constant('CONST', {
            extensionId: 'EXTENSION_ID',
            parseRefigureSite: 'PARSE_REFIGURE_SITE'
        })
        .config(appConfig)
        .config(themeConfig)
        .run(appRun);

    appConfig.$inject = [
        '$httpProvider',
        '$locationProvider',
        'AnalyticsProvider'
    ];

    function appConfig($httpProvider, $locationProvider, AnalyticsProvider) {
        $locationProvider.html5Mode(true);
        $httpProvider.interceptors.push('authInterceptor');
        $httpProvider.interceptors.push('authErrorInterceptor');
        $httpProvider.interceptors.push('errorInterceptor');

        AnalyticsProvider.setAccount('$GOOGLE_ANALYTICS$');
        AnalyticsProvider.setPageEvent('$stateChangeSuccess');
        AnalyticsProvider.trackUrlParams(true);
        // AnalyticsProvider.setDomainName(
        //     window.location.host.indexOf('localhost') === -1 ? window.location.host : 'none'
        // );
    }

    appRun.$inject = [
        '$rootScope',
        'auth',
        'Analytics'
    ];

    //Analytics must be injected at least once
    function appRun($rootScope, auth, Analytics) {
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
