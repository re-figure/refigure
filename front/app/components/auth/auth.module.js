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
            'google-signin',
            'ngFacebook',
            'ngMessages'
        ])
        .constant('authApiUri', '/api')
        .config(Config)
        .run(Run);

    Config.$inject = ['GoogleSigninProvider', '$facebookProvider'];

    function Config(GoogleSigninProvider, $facebookProvider) {
        GoogleSigninProvider.init({
            clientId: 'GOOGLE_CLIENT_ID',
            scope: 'profile'
        });

        $facebookProvider.setAppId('FACEBOOK_CLIENT_ID');
        $facebookProvider.setVersion('v2.9');
        $facebookProvider.setPermissions([
            'public_profile',
            'email'
        ]);
    }

    Run.$inject = ['$rootScope', 'GoogleSignin', 'auth'];

    function Run($rootScope, GoogleSignin, auth) {
        var js = document.createElement('script'),
            fjs = document.getElementsByTagName('script')[0];

        js.id = 'facebook-jssdk';
        js.src = '//connect.facebook.net/en_US/sdk.js';
        fjs.parentNode.insertBefore(js, fjs);

        $rootScope.$on('ng-google-signin:isSignedIn', function (event, isSignedIn) {
            if (isSignedIn && !auth.isAuthenticated()) {
                auth.oAuth.google(GoogleSignin.getUser().getAuthResponse()['id_token']);
            }
        });

        $rootScope.$on('fb.auth.authResponseChange', function (e, resp) {
            if (resp.status === 'connected' && !auth.isAuthenticated()) {
                auth.oAuth.fb(resp.authResponse.accessToken);
            }
        });
    }

})(window.angular);
