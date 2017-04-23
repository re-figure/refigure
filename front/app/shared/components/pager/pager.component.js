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
        .module('refigureShared')
        .component('pager', {
            templateUrl: 'view/pager.component.html',
            controller: PagerCtrl,
            controllerAs: 'vm',
            bindings: {
                total: '<',
                searchParams: '=',
                defaultSort: '@'
            }
        });

    PagerCtrl.$inject = ['$scope', '$state'];

    function PagerCtrl($scope, $state) {
        var vm = this;
        var defaults = {
            query: '',
            from: 0,
            size: 5,
            sortDirection: 'ASC',
            sortField: 'Metapublication.Title'
        };

        vm.updateState = updateState;
        vm.changeSort = changeSort;

        vm.sortBy = {
            relevance: {
                stateParams: {
                    from: 0,
                    sortDirection: '',
                    sortField: ''
                },
                name: 'by relevance'
            },
            figCountDesc: {
                stateParams: {
                    from: 0,
                    sortDirection: 'DESC',
                    sortField: 'FiguresCount'
                },
                name: 'by number of images - largest at top'
            },
            figCountAsc: {
                stateParams: {
                    from: 0,
                    sortDirection: 'ASC',
                    sortField: 'FiguresCount'
                },
                name: 'by number of images - smallest at top'
            },
            nameAsc: {
                stateParams: {
                    from: 0,
                    sortDirection: 'ASC',
                    sortField: 'Metapublication.Title'
                },
                name: 'by name - A..Z'
            },
            nameDesc: {
                stateParams: {
                    from: 0,
                    sortDirection: 'DESC',
                    sortField: 'Metapublication.Title'
                },
                name: 'by name - Z..A'
            },
            visitsDesc: {
                stateParams: {
                    from: 0,
                    sortDirection: 'DESC',
                    sortField: 'Visit.Count'
                },
                name: 'by popularity - most at top'
            },
            visitsAsc: {
                stateParams: {
                    from: 0,
                    sortDirection: 'ASC',
                    sortField: 'Visit.Count'
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

        //////////////////////////////////////////

        function activate() {
            vm.sortKey = vm.defaultSort || 'relevance';
            vm.searchParams = $state.params;
            angular.forEach(vm.searchParams, function (val, key) {
                if (val === undefined && angular.isDefined(defaults[key])) {
                    vm.searchParams[key] = defaults[key];
                }
            });
            angular.extend({}, vm.sortBy[vm.sortKey].stateParams, vm.searchParams);
            updateState(vm.searchParams);

            $scope.$watch('vm.total', function () {
                if (vm.total) {
                    vm.paging = {
                        pages: Math.ceil(vm.total / vm.searchParams.size)
                    };
                    vm.paging.pageArr = new Array(vm.paging.pages);
                }
            });
            $scope.$on('$mdMenuOpen', toggleMenu);
            $scope.$on('$mdMenuClose', toggleMenu);
        }

        function toggleMenu() {
            vm.isMenuOpened = !vm.isMenuOpened;
        }

        function updateState(searchParams) {
            $state.go($state.current.name, searchParams);
        }

        function changeSort(key) {
            vm.sortKey = key;
            updateState(vm.sortBy[vm.sortKey].stateParams);
        }
    }

})(window.angular);
