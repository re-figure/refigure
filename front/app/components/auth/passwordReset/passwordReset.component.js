/**
 * @ngdoc directive
 * @name refigureAuth.directive:passwordReset
 * @restrict E
 * @description
 * Reset password page
 * @example
 * <password-reset></password-reset>
 */
(function (angular) {
    'use strict';

    angular
        .module('refigureAuth')
        .component('passwordReset', {
            templateUrl: 'view/passwordReset.component.html',
            controller: Controller,
            controllerAs: 'vm'
        });

    Controller.$inject = [
        '$stateParams',
        '$timeout',
        'authApiUri',
        'auth'
    ];

    function Controller($stateParams, $timeout, authApiUri, auth) {
        var vm = this;
        vm.error = null;
        vm.loading = false;
        vm.form = null;
        vm.captchaUrl = null;
        vm.step = $stateParams.hash ? 'request' : 'email';
        vm.data = {
            token: $stateParams.hash,
            Email: '',
            Password: '',
            captcha: ''
        };
        vm.PasswordConfirm = '';

        vm.reloadCaptcha = reloadCaptcha;
        vm.pwdRemind = pwdRemind;
        vm.pwdReset = pwdReset;
        vm.pwdValidate = pwdValidate;

        activate();

        /////////////////////

        /**
         * @ngdoc method
         * @name refigureAuth.directive:passwordReset#activate
         * @methodOf refigureAuth.directive:passwordReset
         * @description
         * Activates controller
         */
        function activate() {
            if (vm.step === 'email') {
                reloadCaptcha();
            }
            if (vm.step === 'request') {
                checkResetToken();
            }
        }

        /**
         * @ngdoc method
         * @name refigureAuth.directive:passwordReset#checkResetToken
         * @methodOf refigureAuth.directive:passwordReset
         * @description
         * It checks whether reset password token is valid
         */
        function checkResetToken() {
            vm.error = null;
            vm.loading = true;
            auth
                .checkResetToken(vm.data)
                .then(function (res) {
                    vm.step = 'password';
                })
                .catch(function (res) {
                    vm.error = utils.get(res, ['data', 'message']);
                })
                .finally(function () {
                    vm.loading = false;
                })
        }

        /**
         * @ngdoc method
         * @name refigureAuth.directive:passwordReset#reloadCaptcha
         * @methodOf refigureAuth.directive:passwordReset
         * @description
         * Reloads security code picture
         */
        function reloadCaptcha() {
            //vm.captchaId = null;
            $timeout(function () {
                vm.captchaUrl = authApiUri + '/captcha/?' + utils.uniqueId();
            });
        }

        /**
         * @ngdoc method
         * @name refigureAuth.directive:passwordReset#pwdRemind
         * @methodOf refigureAuth.directive:passwordReset
         * @description
         * Send email to reset password
         */
        function pwdRemind() {
            vm.error = null;
            vm.loading = true;
            auth
                .remindPassword(vm.data)
                .then(function () {
                    vm.step = 'sent';
                })
                .catch(function (res) {
                    vm.error = utils.get(res, ['data', 'message']);
                })
                .finally(function () {
                    vm.loading = false;
                });
        }

        /**
         * @ngdoc method
         * @name refigureAuth.directive:passwordReset#pwdValidate
         * @methodOf refigureAuth.directive:passwordReset
         * @description
         * Validates new password
         */
        function pwdValidate() {
            return null;
        }

        /**
         * @ngdoc method
         * @name refigureAuth.directive:passwordReset#pwdReset
         * @methodOf refigureAuth.directive:passwordReset
         * @description
         * Resets password
         */
        function pwdReset() {
            vm.error = vm.data.Password !== vm.PasswordConfirm ? 'The passwords you entered did not match' : null;
            if (!vm.error) {
                vm.loading = true;
                auth
                    .resetPassword(vm.data)
                    .then(function () {
                        vm.step = 'complete';
                    })
                    .catch(function (res) {
                        vm.error = utils.get(res, ['data', 'message']);
                    })
                    .finally(function () {
                        vm.loading = false;
                    });
            }
        }
    }
}(window.angular));
