/**
 * @ngdoc directive
 * @name refigureApp.directives:collectionEdit
 * @restrict E
 * @description
 * Search Results
 * @example
 * <collection-edit></collection-edit>
 */
(function (angular) {
    'use strict';

    angular
        .module('refigureShared')
        .component('collectionEdit', {
            templateUrl: 'view/collectionEdit.component.html',
            controller: EditController,
            controllerAs: 'vm'
        });

    EditController.$inject = ['$scope', 'collectionEditService', 'modalDialog'];

    function EditController($scope, collectionEditService, modalDialog) {
        var vm = this;

        vm.loading = false;
        vm.forms = {};

        vm.saveCollection = saveCollection;
        vm.removeImage = removeImage;
        vm.saveImage = saveImage;
        vm.svc = collectionEditService;

        activate();

        /////////////////////////////////

        function activate() {
            $scope.$watch('vm.sidebarOpened', function (val) {
                if (!val) {
                    collectionEditService.reset();
                }
            });
        }

        function saveCollection() {
            vm.loading = true;
            collectionEditService
                .saveCollection()
                .finally(function () {
                    vm.loading = false;
                });
        }

        function removeImage(index) {
            modalDialog
                .confirm('Delete this image?')
                .then(function () {
                    collectionEditService
                        .removeImage(index);
                });
        }

        function saveImage(index) {
            if (vm.svc.collection.ID && vm.forms['f' + index].$dirty) {
                collectionEditService.saveImage(index);
            }
        }

    }

})(window.angular);
