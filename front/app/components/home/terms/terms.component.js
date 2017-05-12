/**
 * @ngdoc directive
 * @name refigureAuth.directive:terms
 * @restrict E
 * @description
 * Terms Page
 * @example
 * <terms></terms>
 */
(function(angular) {
    'use strict';

    angular
        .module('refigureAuth')
        .component('terms', {
            templateUrl: 'view/terms.component.html',
            controller: Controller,
            controllerAs: 'vm',
            bindings: {
                hideTitle: '@'
            }
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
