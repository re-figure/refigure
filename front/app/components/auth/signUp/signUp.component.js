/**
 * @ngdoc directive
 * @name refigureAuth.directive:signUp
 * @restrict E
 * @description
 * Sign in page
 * @example
 * <sign-up></sign-up>
 */
(function (angular) {
    'use strict';

    angular
        .module('refigureAuth')
        .component('signUp', {
            templateUrl: 'view/signUp.component.html',
            controller: Controller,
            controllerAs: 'vm'
        });

    Controller.$inject = [
        '$state',
        '$stateParams',
        '$timeout',
        'authApiUri',
        'auth',
        'modalDialog'
    ];

    function Controller($state, $stateParams, $timeout, authApiUri, auth, modal) {
        var vm = this;
        vm.error = null;
        vm.loading = false;
        vm.form = null;
        vm.captchaUrl = null;
        vm.step = $stateParams.hash ? 'validate' : 'form';
        vm.ConfirmPassword = '';
        vm.data = {
            token: $stateParams.hash,
            FirstName: '',
            LastName: '',
            Email: '',
            Organization: '',
            Phone: '',
            Password: '',
            captcha: '',
            agreed: false
        };

        vm.reloadCaptcha = reloadCaptcha;
        vm.register = register;
        vm.start = start;
        vm.showTerms = showTerms;
        vm.comparePasswords = comparePasswords;

        activate();

        /////////////////////

        /**
         * @ngdoc method
         * @name refigureAuth.directive:signUp#activate
         * @methodOf refigureAuth.directive:signUp
         * @description
         * Activates controller
         */
        function activate() {
            if (vm.step === 'form') {
                reloadCaptcha();
            }
            if (vm.step === 'validate') {
                validate();
            }
        }

        /**
         * @ngdoc method
         * @name refigureAuth.directive:signUp#reloadCaptcha
         * @methodOf refigureAuth.directive:signUp
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
         * @name refigureAuth.directive:signUp#submit
         * @methodOf refigureAuth.directive:signUp
         * @description
         * Registers user with the specified info
         */
        function register() {
            vm.error = null;
            vm.loading = true;
            auth
                .register(vm.data)
                .then(function () {
                    vm.step = 'sent';
                })
                .catch(function (res) {
                    vm.error = utils.get(res, ['data', 'message']);
                    reloadCaptcha();
                })
                .finally(function () {
                    vm.loading = false;
                });
        }

        /**
         * @ngdoc method
         * @name refigureAuth.directive:signUp#validate
         * @methodOf refigureAuth.directive:signUp
         * @description
         * Validates confirmation url
         */
        function validate() {
            vm.error = null;
            vm.loading = true;
            auth
                .validateRegistration(vm.data.token)
                .then(function (res) {
                    vm.step = 'complete';
                    vm.data = res;
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
         * @name refigureAuth.directive:signUp#start
         * @methodOf refigureAuth.directive:signUp
         * @description
         * Starts using (goes to profile)
         */
        function start() {
            $state.go('profile');
        }

        function showTerms(e) {
            if (!vm.data.agreed) {
                e.stopImmediatePropagation();
                modal
                    .show({
                        templateUrl: 'view/signUpTerms.modal.html',
                        targetEvent: e,
                        controller: angular.noop,
                        bindToController: true,
                        locals: {
                            ok: modal.ok,
                            cancel: modal.cancel
                        },
                        controllerAs: 'vm',
                        clickOutsideToClose: true
                    })
                    .then(
                        function () {
                            vm.data.agreed = true;
                        },
                        angular.noop
                    );
            }
        }

        function comparePasswords() {
            vm.form.ConfirmPassword.$setValidity('pass-confirm-equals', vm.ConfirmPassword === vm.data.Password);
            console.log(vm.form, vm.form.ConfirmPassword, vm.ConfirmPassword === vm.data.Password);
        }

    }
}(window.angular));
