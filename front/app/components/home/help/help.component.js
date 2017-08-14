/**
 * @ngdoc directive
 * @name refigureApp.directive:help
 * @restrict E
 * @description
 * Help Page
 * @example
 * <help></help>
 */
(function(angular) {
    'use strict';

    angular
        .module('refigureApp')
        .component('help', {
            templateUrl: 'view/help.component.html',
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
