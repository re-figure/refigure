/**
 * @ngdoc directive
 * @name refigureShared.directives:collectionEdit
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

    EditController.$inject = [
        '$scope',
        '$state',
        'collections',
        'modalDialog',
        'rfToast',
        'rfImages'
    ];

    function EditController($scope, $state, collections, modal, rfToast, rfImages) {
        var vm = this;

        vm.opened = -1;
        vm.opened = -1;
        vm.forms = {};

        vm.saveRefigure = saveRefigure;
        vm.removeImage = removeImage;
        vm.saveImage = saveImage;
        vm.toggleDetails = toggleDetails;
        vm.refigure = null;

        vm.$onInit = activate;

        /////////////////////////////////

        function activate() {
            //sidebar close/open
            $scope.$watch('vm.sidebarOpened', function (val) {
                if (val !== undefined && !val) {
                    $state.go($state.current.name, {edit: null});
                    vm.opened = -1;
                }
            });

            //pseudo state change
            $scope.$watch(function () {
                return $state.params.edit;
            }, function (refigureID) {
                if (refigureID) {
                    collections
                        .get(refigureID)
                        .then(function (resp) {
                            vm.sidebarOpened = true;
                            vm.refigure = resp;
                        });
                }
            });
        }

        /**
         * @ngdoc method
         * @name refigureShared.directives:collectionEdit#saveRefigure
         * @methodOf refigureShared.directives:collectionEdit
         * @description
         * Saves collection
         */
        function saveRefigure() {
            if (vm.form.$valid && vm.form.$dirty) {
                collections
                    .save(vm.refigure)
                    .then(function (refigure) {
                        vm.form.$setPristine();
                        rfToast.show('Refigure saved');
                        $scope.$emit('refigureUpdated', refigure);
                    });
            }
        }

        function toggleDetails(index) {
            vm.opened = vm.opened === index ? -1 : index;
        }

        //////////////////////////////

        /**
         * @ngdoc method
         * @name refigureShared.directives:collectionEdit#removeImage
         * @methodOf refigureShared.directives:collectionEdit
         * @description
         * Removes image
         */
        function removeImage(index) {
            modal
                .confirm('Are you sure you would like to delete this image?')
                .then(function () {
                    vm.refigure.Figures[index]._loading = true;
                    rfImages
                        .remove(vm.refigure.Figures[index].ID)
                        .then(function () {
                            vm.refigure.Figures.splice(index, 1);
                            $scope.$emit('refigureUpdated', {
                                Figures: vm.refigure.Figures
                            });
                            rfToast.show('Image removed');
                        }, function () {
                            vm.refigure.Figures[index]._loading = false;
                        });
                });
        }

        /**
         * @ngdoc method
         * @name refigureShared.directives:collectionEdit#saveImage
         * @methodOf refigureShared.directives:collectionEdit
         * @param {Number} index index of Image to save
         * @description
         * Edits image
         */
        function saveImage(index) {
            //if (vm.refigure.ID && vm.forms['f' + index].$dirty) {
            vm.refigure.Figures[index]._loading = true;
            var image = angular.copy(vm.refigure.Figures[index]);
            delete image.User;
            delete image._loading;
            rfImages
                .save(image)
                .finally(function () {
                    if (vm.refigure) {
                        vm.refigure.Figures[index]._loading = false;
                        $scope.$emit('refigureUpdated', {
                            Figures: vm.refigure.Figures
                        });
                    }
                });
            //}
        }
    }

})(window.angular);
