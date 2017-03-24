/**
 * @ngdoc directive
 * @name refigureProfile.directive:profilePage
 * @restrict E
 * @description
 * Profile page
 * @example
 * <profile-page></profile-page>
 */
(function (angular) {
    'use strict';

    angular
        .module('refigureProfile')
        .component('profilePage', {
            templateUrl: 'view/profilePage.component.html',
            controller: Controller,
            controllerAs: 'vm'
        });

    Controller.$inject = [
        '$rootScope',
        '$scope',
        '$state',
        '$mdSidenav',
        'auth'
    ];

    function Controller($rootScope, $scope, $state, $mdSidenav, auth) {
        var vm = this;
        vm.projectName = $rootScope.projectName;
        vm.state = $state;
        vm.menuItems = [{
            state: 'home.search'
        }, {
            state: 'profile.collections'
        }, {
            state: 'profile.account'
        }];

        vm.toggleSideBar = toggleSideBar;
        vm.signOut = signOut;

        activate();

        /////////////////////

        /**
         * @ngdoc method
         * @name refigureProfile.directive:profilePage#activate
         * @methodOf refigureProfile.directive:profilePage
         * @description
         * Activates controller
         */
        function activate() {
            vm.menuItems.forEach(function (_item) {
                var info = $state.get(_item.state) || {};
                angular.extend(_item, info.data);
            });
            $scope.$on('$viewContentLoaded', function () {
                toggleSideBar('close');
            });
        }

        /**
         * @ngdoc method
         * @name refigureProfile.directive:profilePage#toggleSideBar
         * @methodOf refigureProfile.directive:profilePage
         * @param {string} action open/toggle/close
         * @description
         * Opens side bar (mobile only)
         */
        function toggleSideBar(action) {
            var method = action || 'toggle';
            $mdSidenav('profile-sidenav')[method]();
        }

        /**
         * @ngdoc method
         * @name refigureProfile.directive:profilePage#signOut
         * @methodOf refigureProfile.directive:profilePage
         * @description
         * Sign out
         */
        function signOut() {
            auth
                .logout()
                .then(function () {
                    $state.go('auth.signin');
                });
        }
    }
})(window.angular);
