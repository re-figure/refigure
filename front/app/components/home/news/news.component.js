/**
 * @ngdoc directive
 * @name refigureApp.directive:news
 * @restrict E
 * @description
 * News Page
 * @example
 * <news></news>
 */
(function(angular) {
    'use strict';

    angular
        .module('refigureApp')
        .component('news', {
            templateUrl: 'view/news.component.html',
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
         * @name refigureApp.directive:news#activate
         * @methodOf refigureApp.directive:news
         * @description
         * Activates controller
         */
        function activate() {

        }
    }
})(window.angular);
