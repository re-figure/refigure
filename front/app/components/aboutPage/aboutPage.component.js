/**
 * @ngdoc directive
 * @name refigureApp.directive:aboutPage
 * @restrict E
 * @description
 * About Page
 * @example
 * <about-page></about-page>
 */
(function(angular) {
    'use strict';

    angular
        .module('refigureApp')
        .component('aboutPage', {
            templateUrl: 'view/aboutPage.component.html',
            controller: Controller,
            controllerAs: 'vm'
        });

    Controller.$inject = [];

    function Controller() {
        var vm = this;

        activate();

        /////////////////////

        function activate() {

        }
    }
})(window.angular);
