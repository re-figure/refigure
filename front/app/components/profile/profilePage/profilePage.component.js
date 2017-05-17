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
        '$facebook',
        'auth',
        'GoogleSignin',
        'authUserInfo'
    ];

    function Controller($rootScope, $scope, $state, $mdSidenav, $facebook, auth, GoogleSignin, authUserInfo) {
        var vm = this;
        vm.projectName = $rootScope.projectName;
        vm.state = $state;
        vm.menuItems = [{
            state: 'profile.myCollections'
        }, {
            state: 'profile.account'
        }];
        vm.userInfo = authUserInfo;

        vm.toggleSideBar = toggleSideBar;
        vm.signOut = signOut;

        vm.$onInit = activate;

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
            auth.usrInfo().then(function (user) {
                if (user.Type === 2) {
                    addStateToMenu('profile.users');
                    addStateToMenu('profile.collections');
                    addStateToMenu('profile.dashboard');
                }
                if ($state.current.name === 'profile') {
                    $state.go(user.Type === 2 ? '.dashboard' : '.myCollections', null, {
                        location: 'reload'
                    });
                }
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
                    if (GoogleSignin.isSignedIn()) {
                        GoogleSignin.signOut();
                    }
                    if ($facebook.isConnected()) {
                        $facebook.logout();
                    }
                    $state.go('auth.signin');
                });
        }

        function addStateToMenu(state) {
            var stateData = $state.get(state).data;
            stateData.state = state;
            vm.menuItems.unshift(stateData);
        }
    }
})(window.angular);
