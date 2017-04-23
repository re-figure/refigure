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
        '$state',
        'collections',
        'collections',
        'modalDialog',
        'rfToast',
        'authUserInfo'
    ];
    //collectionEditService
    function Controller($scope, $state, collections, modal, rfToast, authUserInfo) {
        var vm = this;
        vm.error = null;
        vm.loading = false;
        vm.response = {};
        vm.searchParams = null;
        vm.remove = remove;
        vm.submit = submit;
        vm.isAdmin = isAdmin;

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
            $scope.$watchCollection('vm.searchParams', function (params, prevParams) {
                if (params && (!prevParams || params.refigure === prevParams.refigure)) {
                    load(params);
                }
            });
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
         * @param {Object} params state params
         * @description
         * Loads component data
         */
        function load(params) {
            vm.error = null;
            vm.loading = true;
            collections
                .myCollections(params)
                .then(function (data) {
                    vm.response = data;
                })
                .finally(function () {
                    vm.loading = false;
                });
        }

        function remove(index) {
            modal
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

        function submit(term) {
            $state.go($state.current.name, {
                query: term,
                from: 0
            });
        }

        function isAdmin() {
            return authUserInfo.Type === 2;
        }
    }
})(window.angular);
