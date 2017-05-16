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
            'ngFacebook'
        ])
        .constant('authApiUri', '/api')
        .constant('OAuthCfg', {
            google: {
                clientId: 'GOOGLE_CLIENT_ID',
                apiKey: 'GOOGLE_API_KEY'
            },
            facebook: {
                appId: 'FACEBOOK_APP_ID'
            }
        })
        .config(Config)
        .run(Run);

    Config.$inject = ['GoogleSigninProvider', '$facebookProvider', 'OAuthCfg'];

    function Config(GoogleSigninProvider, $facebookProvider, OAuthCfg) {
        GoogleSigninProvider.init({
            apiKey: OAuthCfg.google.apiKey,
            clientId: OAuthCfg.google.clientId,
            scope: 'profile'
        });

        $facebookProvider.setAppId(OAuthCfg.facebook.appId);
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

        $rootScope.$on('fb.auth.login', function (event, opts) {
            console.log('fb.auth.login', arguments);
        });

        $rootScope.$on('fb.auth.authResponseChange', function (e, resp) {
            if (resp.status === 'connected') {
                auth.oAuth.fb(resp.authResponse.accessToken);
            }
        });
    }

})(window.angular);
