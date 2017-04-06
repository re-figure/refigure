/**
 * @ngdoc directive
 * @name refigureApp.directive:mostVisited
 * @restrict E
 * @description
 * Search Results
 * @example
 * <most-visited></most-visited>
 */
(function (angular) {
    'use strict';

    angular
        .module('refigureApp')
        .component('pager', {
            templateUrl: 'view/pager.component.html',
            controller: PagerCtrl,
            controllerAs: 'vm',
            bindings: {
                total: '<',
                searchParams: '='
            }
        });

    PagerCtrl.$inject = ['$scope'];

    function PagerCtrl($scope) {
        var vm = this;
        var inited = false;

        var searchParams = {
            query: '',
            from: 0,
            size: 5,
            sortDirection: '',
            sortField: '',
            filters: []
        };

        vm.sortKey = 'relevance';

        vm.changeSort = function (key) {
            vm.sortKey = key;
            vm.sortBy[vm.sortKey].action();
        };

        vm.sortBy = {
            relevance: {
                action: function () {
                    var query = vm.searchParams.query;
                    vm.searchParams = searchParams;
                    vm.searchParams.query = query;
                },
                name: 'by relevance'
            },
            figCountDesc: {
                action: function () {
                    vm.searchParams.sortDirection = 'DESC';
                    vm.searchParams.sortField = 'FiguresCount';
                },
                name: 'by number of figures - largest at top'
            },
            figCountAsc: {
                action: function () {
                    vm.searchParams.sortDirection = 'ASC';
                    vm.searchParams.sortField = 'FiguresCount';
                },
                name: 'by number of figures - smallest at top'
            },
            nameAsc: {
                action: function () {
                    vm.searchParams.sortDirection = 'ASC';
                    vm.searchParams.sortField = 'Metapublication.Title';
                },
                name: 'by name - A..Z'
            },
            nameDesc: {
                action: function () {
                    vm.searchParams.sortDirection = 'DESC';
                    vm.searchParams.sortField = 'Metapublication.Title';
                },
                name: 'by name - Z..A'
            },
            visitsDesc: {
                action: function () {
                    vm.searchParams.sortDirection = 'DESC';
                    vm.searchParams.sortField = 'Visit.Count';
                },
                name: 'by popularity - most at top'
            },
            visitsAsc: {
                action: function () {
                    vm.searchParams.sortDirection = 'ASC';
                    vm.searchParams.sortField = 'Visit.Count';
                },
                name: 'by popularity - less at top'
            }
        };

        vm.isMenuOpened = false;

        vm.sortFieldVariant = {
            'Visit.Count': 'visits',
            'FiguresCount': 'figures count',
            'Metapublication.Title': 'name'
        };

        vm.$onInit = activate;
        vm.$onChanges = onChanges;

        //////////////////////////////////////////

        function activate() {
            angular.extend(vm.searchParams, searchParams);
            inited = true;
            $scope.$on('$mdMenuOpen', toggleMenu);
            $scope.$on('$mdMenuClose', toggleMenu);
        }

        function toggleMenu() {
            vm.isMenuOpened = !vm.isMenuOpened;
        }

        function onChanges() {
            if (inited) {
                vm.paging = {
                    curr: vm.searchParams.from,
                    pages: Math.ceil(vm.total / vm.searchParams.size)
                };
                vm.paging.pageArr = new Array(vm.paging.pages);
            }
        }
    }

})(window.angular);
