/**
 * @ngdoc object
 * @name refigureAuth
 * @description
 * Authentication module
 */
(function (angular) {
    'use strict';

    angular
        .module('refigureAuth', [
            'ui.router',
            'router.helper',
            'ngCookies',
            'refigureShared',
            'google-signin'
        ])
        .constant('authApiUri', '/api')
        .config(Config)
        .run(Run);

    Config.$inject = ['GoogleSigninProvider'];

    function Config(GoogleSigninProvider) {
        GoogleSigninProvider.init({
            apiKey: 'AIzaSyCnDKJt_n3eS3QtqLqcTkMu2vaCaguPCqU',
            clientId: '604123564572-uuu98pul48vj6t2uqgu2epi8723egmli.apps.googleusercontent.com',
            scope: 'profile'
        });
    }

    Run.$inject = ['$rootScope', 'GoogleSignin', 'auth'];

    function Run($rootScope, GoogleSignin, auth) {
        $rootScope.$on('ng-google-signin:isSignedIn', function (event, isSignedIn) {
            if (isSignedIn && !auth.isAuthenticated()) {
                auth.oAuthGoogle(GoogleSignin.getUser().getAuthResponse()['id_token']);
            }
        });
    }

})(window.angular);
