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

        vm.results = [];

        $scope.term = $stateParams.term;

        vm.total = 0;

        vm.searchParams = {
            query: $stateParams.term,
            from: 0,
            size: 5,
            sortDirection: '',
            sortField: ''
        };

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
            $scope.$watchCollection('vm.searchParams', load);
        }

        /**
         * @ngdoc method
         * @name refigureApp.directive:searchResults#load
         * @methodOf refigureApp.directive:searchResults
         * @description
         * Loads component data
         */
        function load() {
            collections.search(vm.searchParams).then(function (res) {
                vm.results = res.results;
                vm.total = res.found;
            });
        }

        function submit(term) {
            vm.searchParams.query = term;
        }
    }
})(window.angular);
