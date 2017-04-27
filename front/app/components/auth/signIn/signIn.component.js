/**
 * @ngdoc directive
 * @name refigureAuth.directive:signIn
 * @restrict E
 * @description
 * Sign in page
 * @example
 * <sign-in></sign-in>
 */
(function (angular) {
    'use strict';

    angular
        .module('refigureAuth')
        .run(function () {
            var po = document.createElement('script');
            po.type = 'text/javascript';
            po.async = true;
            po.src = 'https://apis.google.com/js/platform.js';
            var s = document.getElementsByTagName('script')[0];
            s.parentNode.insertBefore(po, s);
        })
        .component('signIn', {
            templateUrl: 'view/signIn.component.html',
            controller: Controller,
            controllerAs: 'vm'
        });

    Controller.$inject = [
        'auth',
        'GooglePlus'
    ];

    function Controller(auth, GooglePlus) {
        var vm = this;
        vm.error = null;
        vm.loading = false;
        vm.form = null;
        vm.data = {
            Email: '',
            Password: ''
        };

        vm.submit = submit;
        vm.withGoogle = withGoogle;

        activate();

        /////////////////////

        /**
         * @ngdoc method
         * @name refigureAuth.controller:AuthSingInCtrl#activate
         * @methodOf refigureAuth.controller:AuthSingInCtrl
         * @description
         * Activates controller
         */
        function activate() {
        }

        /**
         * @ngdoc method
         * @name refigureAuth.controller:AuthSingInCtrl#submit
         * @methodOf refigureAuth.controller:AuthSingInCtrl
         * @description
         * Login
         */
        function submit() {
            vm.error = null;
            vm.loading = true;
            auth
                .login(vm.data)
                .then(function (res) {
                    auth.loadCurrentUrl();
                })
                .catch(function (res) {
                    vm.error = utils.get(res, ['data', 'message']);
                })
                .finally(function () {
                    vm.loading = false;
                });
        }

        function withGoogle() {
            GooglePlus.login().then(function (authResult) {
                console.log('authResult', authResult);

                GooglePlus.getUser().then(function (user) {
                    console.log('user', user);
                });
            }, function (err) {
                console.log(err);
            });
        }
    }
}(window.angular));

window.OnSignIn = function onSignIn(googleUser) {
    // Useful data for your client-side scripts:
    var profile = googleUser.getBasicProfile();
    console.log('ID: ' + profile.getId()); // Don't send this directly to your server!
    console.log('Full Name: ' + profile.getName());
    console.log('Given Name: ' + profile.getGivenName());
    console.log('Family Name: ' + profile.getFamilyName());
    console.log('Image URL: ' + profile.getImageUrl());
    console.log('Email: ' + profile.getEmail());

    // The ID token you need to pass to your backend:
    var idToken = googleUser.getAuthResponse().idToken;
    console.log('ID Token: ' + idToken);
};
