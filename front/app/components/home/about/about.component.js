/**
 * @ngdoc directive
 * @name refigureApp.directive:about
 * @restrict E
 * @description
 * About Page
 * @example
 * <about></about>
 */
(function(angular) {
    'use strict';

    angular
        .module('refigureApp')
        .component('about', {
            templateUrl: 'view/about.component.html',
            controller: Controller,
            controllerAs: 'vm'
        });

    Controller.$inject = [];

    function Controller() {
        var vm = this;

        activate();

        /////////////////////

        /**
         * @ngdoc method
         * @name refigureApp.directive:about#activate
         * @methodOf refigureApp.directive:about
         * @description
         * Activates controller
         */
        function activate() {

        }
    }
})(window.angular);
