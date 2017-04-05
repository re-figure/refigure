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

    Controller.$inject = ['$scope', 'collections', '$stateParams'];

    function Controller($scope, collections, $stateParams) {
        var vm = this;

        vm.sortDirIcons = {
            ASC: 'keyboard_arrow_up',
            DESC: 'keyboard_arrow_down'
        };

        vm.sortFieldVariant = {
            'Visit.Count': 'visits',
            'FiguresCount': 'figures count',
            'Metapublication.Title': 'name'
        };

        vm.results = [];

        $scope.term = $stateParams.term;

        vm.searchParams = {
            query: $stateParams.term,
            from: 0,
            size: 5,
            sortDirection: 'ASC',
            sortField: 'Visit.Count',
            filters: []
        };

        vm.switchDirection = switchDirection;
        vm.submit = submit;

        activate();

        /////////////////////

        /**
         * @ngdoc method
         * @name refigureApp.directive:searchResults#activate
         * @methodOf refigureApp.directive:searchResults
         * @description
         * Activates controller
         */
        function activate() {
            $scope.$watchCollection('vm.searchParams', function () {
                load();
            });
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
                countPaging(res.found);
                vm.results = res.results;
            });
        }

        function countPaging(found) {
            vm.paging = {
                curr: vm.searchParams.from,
                found: found,
                pages: Math.ceil(found / vm.searchParams.size)
            };
            vm.paging.pageArr = new Array(vm.paging.pages);
        }

        function submit(term) {
            vm.searchParams.query = term;
        }

        function switchDirection() {
            vm.searchParams.sortDirection = vm.searchParams.sortDirection === 'ASC' ? 'DESC' : 'ASC';
        }
    }
})(window.angular);
