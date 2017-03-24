/**
 * @ngdoc directive
 * @name refigureApp.directive:searchResultsPage
 * @restrict E
 * @description
 * Search Results page
 * @example
 * <search-results-page></search-results-page>
 */
(function(angular) {
    'use strict';

    angular
        .module('refigureApp')
        .component('searchResultsPage', {
            templateUrl: 'view/searchResultsPage.component.html',
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
