/**
 * @ngdoc directive
 * @name refigureApp.directive:mainHeader
 * @restrict E
 * @description
 * Main header
 * @example
 * <main-header></main-header>
 */
(function(angular) {
    'use strict';

    angular
        .module('refigureApp')
        .component('mainHeader', {
            templateUrl: 'view/mainHeader.component.html',
            controller: Controller,
            controllerAs: 'vm'
        });

    Controller.$inject = [
        '$rootScope',
        '$state',
        '$mdSidenav',
        'authUserInfo'
    ];

    function Controller($rootScope, $state, $mdSidenav, authUserInfo) {
        var vm = this;
        vm.projectName = $rootScope.projectName;
        vm.showSearch = true;
        vm.searchTerm = '';
        vm.menuItems = [{
            state: 'home.search'
        }, {
            state: 'home.about'
        }, {
            state: 'home.blog'
        }, {
            state: 'home.terms'
        }];

        vm.userInfo = authUserInfo;

        vm.toggle = buildToggler('main-sidenav');

        activate();

        /////////////////////

        /**
         * @ngdoc method
         * @name refigureApp.directive:mainHeader#activate
         * @methodOf refigureApp.directive:mainHeader
         * @description
         * It activates controller
         */
        function activate() {
            vm.state = $state.current;
            $rootScope.$on('$stateChangeSuccess', function (e, toState) {
                vm.state = toState;
            });
            vm.menuItems.forEach(function (_item) {
                var info = $state.get(_item.state) || {};
                angular.extend(_item, info.data);
            });
        }

        /**
         **
         * @ngdoc method
         * @name refigureApp.directive:mainHeader#activate
         * @methodOf refigureApp.directive:mainHeader
         * @param componentId
         * @returns {Function}
         * @description
         * Toggles the specified sidebar
         */
        function buildToggler(componentId) {
            return function() {
                $mdSidenav(componentId).toggle();
            };
        }
    }
})(window.angular);
