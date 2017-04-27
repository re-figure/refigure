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

    Config.$inject = ['GoogleSigninProvider'];

    function Config(GoogleSigninProvider) {
        GoogleSigninProvider.init({
            apiKey: 'AIzaSyCnDKJt_n3eS3QtqLqcTkMu2vaCaguPCqU',
            clientId: '604123564572-uuu98pul48vj6t2uqgu2epi8723egmli.apps.googleusercontent.com',
            scope: 'profile'
        });
    }

})(window.angular);
