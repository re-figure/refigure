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
        .component('signIn', {
            templateUrl: 'view/signIn.component.html',
            controller: Controller,
            controllerAs: 'vm'
        });

    Controller.$inject = [
        'auth',
        'GoogleSignin',
        '$facebook'
    ];

    function Controller(auth, GoogleSignin, $facebook) {
        var vm = this;
        vm.error = null;
        vm.loading = false;
        vm.form = null;
        vm.data = {
            Email: '',
            Password: ''
        };

        vm.submit = submit;
        vm.signWithGoogle = signWithGoogle;
        vm.signWithFacebook = signWithFacebook;
        vm.$onInit = activate;

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
                .then(function () {
                    auth.loadCurrentUrl();
                })
                .catch(function (res) {
                    vm.error = utils.get(res, ['data', 'message']);
                })
                .finally(function () {
                    vm.loading = false;
                });
        }

        function signWithGoogle() {
            GoogleSignin.signIn();
        }

        function signWithFacebook() {
            $facebook.login();
        }
    }

}(window.angular));
