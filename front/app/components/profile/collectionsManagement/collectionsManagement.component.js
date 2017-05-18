/**
 * @ngdoc directive
 * @name refigureProfile.directive:collectionsManagement
 * @restrict E
 * @description
 * Admin collections management
 * @example
 * <collections-management></collections-management>
 */
(function (angular) {
    'use strict';

    angular
        .module('refigureProfile')
        .component('collectionsManagement', {
            templateUrl: 'view/collectionsManagement.component.html',
            controller: Controller,
            controllerAs: 'vm'
        });

    Controller.$inject = [
        '$scope',
        '$state',
        'collections',
        'modalDialog',
        'rfToast'
    ];

    function Controller($scope, $state, collections, modal, rfToast) {
        var vm = this;
        vm.error = null;
        vm.loading = false;
        vm.refigures = [];
        vm.total = 0;
        vm.searchParams = null;
        vm.remove = remove;
        vm.submit = submit;

        activate();

        /////////////////////

        /**
         * @ngdoc method
         * @name refigureProfile.directive:myCollections#activate
         * @methodOf refigureProfile.directive:myCollections
         * @description
         * Activates controller
         */
        function activate() {
            $scope.$watchCollection('vm.searchParams', function (params) {
                if (params) {
                    vm.term = params.query;
                    load(params);
                }
            });
        }

        /**
         * @ngdoc method
         * @name refigureProfile.directive:myCollections#load
         * @methodOf refigureProfile.directive:myCollections
         * @param {Object} params state params
         * @description
         * Loads component data
         */
        function load(params) {
            vm.error = null;
            vm.loading = true;
            collections
                .search(params)
                .then(function (data) {
                    vm.found = data.found;
                    vm.refigures = data.results;
                })
                .finally(function () {
                    vm.loading = false;
                });
        }

        function remove(index) {
            modal
                .confirm('Are you sure you would like to delete this refigure?')
                .then(function () {
                    collections
                        .remove(vm.refigures[index].ID)
                        .then(function () {
                            vm.refigures.splice(index, 1);
                            vm.found--;
                            rfToast.show('Refigure deleted');
                        }, angular.noop);
                });
        }

        function submit() {
            $state.go($state.current.name, {
                query: vm.term,
                from: 0
            });
        }
    }
})(window.angular);
