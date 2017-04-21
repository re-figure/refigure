/**
 * @ngdoc directive
 * @name refigureProfile.directive:myCollections
 * @restrict E
 * @description
 * Profile page
 * @example
 * <my-collections></my-collections>
 */
(function (angular) {
    'use strict';

    angular
        .module('refigureProfile')
        .component('myCollections', {
            templateUrl: 'view/myCollections.component.html',
            controller: Controller,
            controllerAs: 'vm'
        });

    Controller.$inject = [
        '$scope',
        'collections',
        'collections',
        'modalDialog',
        'rfToast'
    ];
    //collectionEditService
    function Controller($scope, collections, modalDialog, rfToast) {
        var vm = this;
        vm.error = null;
        vm.loading = false;
        vm.response = {};
        vm.searchParams = {
            query: '',
            from: 0,
            size: 5,
            sortDirection: 'ASC',
            sortField: 'Metapublication.Title'
        };
        vm.remove = remove;

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
            $scope.$watchCollection('vm.searchParams', load);
            $scope.$on('refigureUpdated', function (e, updated) {
                e.stopPropagation();
                vm.response.results.forEach(function (refigure) {
                    if (refigure.ID === updated.ID) {
                        angular.extend(refigure, updated);
                    }
                });
            });
        }

        /**
         * @ngdoc method
         * @name refigureProfile.directive:myCollections#load
         * @methodOf refigureProfile.directive:myCollections
         * @description
         * Loads component data
         */
        function load() {
            vm.error = null;
            vm.loading = true;
            collections
                .myCollections(vm.searchParams)
                .then(function (data) {
                    vm.response = data;
                })
                .finally(function () {
                    vm.loading = false;
                });
        }

        function remove(index) {
            modalDialog
                .confirm('Delete this refigure?')
                .then(function () {
                    collections
                        .remove(vm.response.results[index].ID)
                        .then(function () {
                            vm.response.results.splice(index, 1);
                            rfToast.show('Refigure deleted');
                        });
                });
        }
    }
})(window.angular);
