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
        '$mdSidenav'
    ];

    function Controller($rootScope, $state, $mdSidenav) {
        var vm = this;
        vm.projectName = $rootScope.projectName;
        vm.showSearch = true;
        vm.searchTerm = '';
        vm.menuItems = [{
            state: 'home.search'
        }, {
            state: 'home.about'
        }, {
            state: 'home.news'
        }];

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
            }
        }
    }
})(window.angular);
