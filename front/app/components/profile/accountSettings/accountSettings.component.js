/**
 * @ngdoc directive
 * @name refigureProfile.directive:accountSettings
 * @restrict E
 * @description
 * Account settings page
 * @example
 * <account-settings></account-settings>
 */
(function(angular) {
    'use strict';

    angular
        .module('refigureProfile')
        .component('accountSettings', {
            templateUrl: 'view/accountSettings.component.html',
            controller: Controller,
            controllerAs: 'vm'
        });

    Controller.$inject = [
        'profile',
        'modalDialog'
    ];

    function Controller(profile, modalDialog) {
        var vm = this;
        vm.error = null;
        vm.loading = false;
        vm.formGeneral = null;
        vm.formPassword = null;
        vm.tab = 0;
        vm.data = {};

        vm.update = update;
        vm.changePassword = changePassword;

        activate();

        /////////////////////

        /**
         * @ngdoc method
         * @name refigureProfile.directive:accountSettings#activate
         * @methodOf refigureProfile.directive:accountSettings
         * @description
         * Activates controller
         */
        function activate() {
            load();
        }

        /**
         * @ngdoc method
         * @name refigureProfile.directive:accountSettings#load
         * @methodOf refigureProfile.directive:accountSettings
         * @description
         * Loads component data
         */
        function load() {
            vm.loading = true;
            profile
                .getAccount()
                .then(function (ret) {
                    vm.data = ret;
                })
                .finally(function () {
                    vm.loading = false;
                });
        }

        /**
         * @ngdoc method
         * @name refigureProfile.directive:accountSettings#update
         * @methodOf refigureProfile.directive:accountSettings
         * @description
         * Updates account settings
         */
        function update() {
            vm.error = null;
            vm.loading = true;
            var data = accountDataFilter(vm.data);
            profile
                .updateAccount(data)
                .then(function (ret) {
                    vm.data = ret;
                    vm.formGeneral.$setPristine();
                    vm.formGeneral.$setUntouched();
                    modalDialog.success('General information has been changed');
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
         * @name refigureProfile.directive:accountSettings#changePassword
         * @methodOf refigureProfile.directive:accountSettings
         * @description
         * Changes password
         */
        function changePassword() {
            var errMsg = 'The passwords you entered did not match';
            vm.error = (vm.data.Password !== vm.data.PasswordConfirm) ? errMsg : null;
            if (vm.error) {
                modalDialog.error(vm.error);
            } else {
                profile
                    .updatePassword(vm.data.Password)
                    .then(function (ret) {
                        vm.data = ret;
                        // TODO:
                        // it does not work as expected
                        // When confirm lost focus it becomes toched....
                        vm.tab = 0;
                        vm.formPassword.$setPristine();
                        vm.formPassword.$setUntouched();
                        //
                        modalDialog.success('Password has been changed');

                    })
                    .catch(function (res) {
                        vm.error = utils.get(res, ['data', 'message']);
                    })
                    .finally(function () {
                        vm.loading = false;
                    });
            }
        }

        /**
         * @ngdoc method
         * @name refigureProfile.directive:accountSettings#accountDataFilter
         * @methodOf refigureProfile.directive:accountSettings
         * @param {Object} data The data to filter
         * @return {Object}
         * filtered data
         * @description
         * returns only account fields
         */
        function accountDataFilter(data) {
            var accountFields = [
                'FirstName',
                'LastName',
                'Email',
                'Organization',
                'Phone',
                'Password'
            ];
            var ret = {};
            accountFields.forEach(function (f) {
                var v = utils.get(data, f);
                if (utils.isset(v)) {
                    ret[f] = v;
                }
            });
            return ret;
        }
    }
})(window.angular);
