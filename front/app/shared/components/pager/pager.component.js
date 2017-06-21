/**
 * @ngdoc directive
 * @name refigureApp.directive:pager
 * @restrict E
 * @description
 * Search Results
 * @example
 * <pager total="20" search-params="stateParams" default-sort="relevance" sort="vm.showSortDropdown"></pager>
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
                defaultSort: '@',
                sort: '@',
                totalLabel: '@'
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
            sortField: 'Metapublication.Title',
            Flagged: 0
        };

        vm.isMenuOpened = false;
        vm.sortBy = {
            relevance: {
                stateParams: {
                    from: 0,
                    sortDirection: '',
                    sortField: ''
                },
                name: 'relevance'
            },
            figCountDesc: {
                stateParams: {
                    from: 0,
                    sortDirection: 'DESC',
                    sortField: 'FiguresCount'
                },
                name: 'number of images - largest at top'
            },
            figCountAsc: {
                stateParams: {
                    from: 0,
                    sortDirection: 'ASC',
                    sortField: 'FiguresCount'
                },
                name: 'number of images - smallest at top'
            },
            nameAsc: {
                stateParams: {
                    from: 0,
                    sortDirection: 'ASC',
                    sortField: 'Metapublication.Title'
                },
                name: 'name - A..Z'
            },
            nameDesc: {
                stateParams: {
                    from: 0,
                    sortDirection: 'DESC',
                    sortField: 'Metapublication.Title'
                },
                name: 'name - Z..A'
            },
            visitsDesc: {
                stateParams: {
                    from: 0,
                    sortDirection: 'DESC',
                    sortField: 'Visit.Count'
                },
                name: 'popularity - most at top'
            },
            visitsAsc: {
                stateParams: {
                    from: 0,
                    sortDirection: 'ASC',
                    sortField: 'Visit.Count'
                },
                name: 'popularity - less at top'
            }
        };

        vm.queryFieldLabels = {
            'Metapublication.Keywords': 'Keywords'
        };

        vm.updateState = updateState;
        vm.resetQueryField = resetQueryField;
        vm.changeSort = changeSort;
        vm.$onInit = activate;

        //////////////////////////////////////////

        function activate() {
            vm.totalLabel = vm.totalLabel || 'Refigures';
            vm.sortKey = vm.defaultSort || 'relevance';
            angular.extend(defaults, vm.sortBy[vm.sortKey].stateParams);
            vm.searchParams = $state.params;
            angular.forEach(vm.searchParams, function (val, key) {
                if (val === undefined && angular.isDefined(defaults[key])) {
                    vm.searchParams[key] = defaults[key];
                }
            });
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

            if (vm.sort && vm.sort === 'false') {
                vm.sortBy = null;
            }
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

        function resetQueryField() {
            $state.go($state.current.name, {queryField: null});
        }
    }

})(window.angular);
