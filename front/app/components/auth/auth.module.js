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
            'googleplus'
        ])
        .constant('authApiUri', '/api')
        .config(Config);

    Config.$inject = ['GooglePlusProvider'];

    function Config(GooglePlusProvider) {
        GooglePlusProvider.init({
            clientId: '604123564572-uuu98pul48vj6t2uqgu2epi8723egmli.apps.googleusercontent.com',
            apiKey: 'AIzaSyCnDKJt_n3eS3QtqLqcTkMu2vaCaguPCqU'
        });
    }

})(window.angular);
