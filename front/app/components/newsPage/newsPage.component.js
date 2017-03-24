/**
 * @ngdoc directive
 * @name refigureApp.directive:newsPage
 * @restrict E
 * @description
 * Home Page
 * @example
 * <news-page></news-page>
 */
(function(angular) {
    'use strict';

    angular
        .module('refigureApp')
        .component('newsPage', {
            templateUrl: 'view/newsPage.component.html',
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
