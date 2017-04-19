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
        vm.opened = -1;
        vm.forms = {};

        vm.saveCollection = saveCollection;
        vm.removeImage = removeImage;
        vm.saveImage = saveImage;
        vm.toggleDetails = toggleDetails;
        vm.svc = collectionEditService;

        activate();

        /////////////////////////////////

        function activate() {
            $scope.$watch('vm.sidebarOpened', function (val) {
                if (!val) {
                    collectionEditService.reset();
                    vm.opened = -1;
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

        function toggleDetails(index) {
            vm.opened = vm.opened === index ? -1 : index;
        }

    }

})(window.angular);
