/**
 * @ngdoc directive
 * @name refigureApp.directive:mainFooter
 * @restrict E
 * @description
 * Main footer
 * @example
 * <main-footer></main-footer>
 */
(function (angular) {
    'use strict';

    angular
        .module('refigureApp')
        .component('mainFooter', {
            templateUrl: 'view/mainFooter.component.html',
            controller: Controller,
            controllerAs: 'vm'
        });

    Controller.$inject = [
    ];

    function Controller() {
        var vm = this;

        activate();

        /////////////////////

        /**
         * @ngdoc method
         * @name refigureApp.directive:mainFooter#activate
         * @methodOf refigureApp.directive:mainFooter
         * @description
         * It activates controller
         */
        function activate() {

        }
    }
})(window.angular);
