/**
 * @ngdoc directive
 * @name refigureApp.directive:searchResults
 * @restrict E
 * @description
 * Search Results
 * @example
 * <search-results></search-results>
 */
(function (angular) {
    'use strict';

    angular
        .module('refigureApp')
        .component('searchResults', {
            templateUrl: 'view/searchResults.component.html',
            controller: Controller,
            controllerAs: 'vm'
        });

    Controller.$inject = ['$scope', '$state', 'collections', '$stateParams'];

    function Controller($scope, $state, collections, $stateParams) {
        var vm = this;

        vm.refigures = [];
        vm.term = $stateParams.query;
        vm.found = 0;
        vm.searchParams = null;

        vm.submit = submit;
        vm.$onInit = activate();

        /////////////////////

        /**
         * @ngdoc method
         * @name refigureApp.directive:searchResults#activate
         * @methodOf refigureApp.directive:searchResults
         * @description
         * Activates controller
         */
        function activate() {
            $state.get('collections.item').data.headerTitle = 'Search results';
            $scope.$watchCollection('vm.searchParams', function (params) {
                if (params) {
                    load(params);
                }
            });
        }

        /**
         * @ngdoc method
         * @name refigureApp.directive:searchResults#load
         * @methodOf refigureApp.directive:searchResults
         * @param {Object} params state params
         * @description
         * Loads component data
         */
        function load(params) {
            collections.search(params).then(function (data) {
                vm.refigures = data.results;
                vm.found = data.found;
            });
        }

        /**
         * @ngdoc method
         * @name refigureApp.directive:searchResults#submit
         * @methodOf refigureApp.directive:searchResults
         * @description
         * Runs search
         */
        function submit() {
            $state.go('home.search-results', {
                from: 0,
                query: vm.term
            });
        }
    }
})(window.angular);
