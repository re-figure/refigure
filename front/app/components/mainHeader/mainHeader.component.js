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
        '$mdSidenav'
    ];

    function Controller($rootScope, $mdSidenav) {
        var vm = this;
        vm.projectName = $rootScope.projectName;
        vm.showSearch = true;
        vm.searchTerm = '';
        vm.menuItems = [{
            state: 'home',
            label: 'Home',
            title: 'Home page'
        }, {
            state: 'about',
            label: 'About',
            title: 'About project'
        }, {
            state: 'news',
            label: 'News',
            title: 'The latest news'
        }];

        vm.toggleLeft = buildToggler('left');
        vm.toggleRight = buildToggler('right');

        activate();

        /////////////////////

        function activate() {

        }

        function buildToggler(componentId) {
            return function() {
                $mdSidenav(componentId).toggle();
            }
        }
    }
})(window.angular);
