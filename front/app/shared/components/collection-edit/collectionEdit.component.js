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

    EditController.$inject = [
        '$scope',
        '$state',
        'collections',
        'modalDialog',
        'rfToast',
        'rfImages'
    ];

    function EditController($scope, $state, collections, modalDialog, rfToast, rfImages) {
        var vm = this;

        vm.loading = false;
        vm.opened = -1;
        vm.forms = {};

        vm.saveRefigure = saveRefigure;
        vm.removeImage = removeImage;
        vm.saveImage = saveImage;
        vm.toggleDetails = toggleDetails;
        vm.refigure = null;

        activate();

        /////////////////////////////////

        function activate() {
            //sidebar close/open
            $scope.$watch('vm.sidebarOpened', function (val) {
                if (val !== undefined && !val) {
                    $state.go($state.current.name, {refigure: null});
                    vm.refigure = null;
                }
            });

            //pseudo state change
            $scope.$watch(function () {
                return $state.params.refigure;
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
         * @name refigureShared.services:collectionEditService#saveRefigure
         * @methodOf refigureShared.services:collectionEditService
         * @description
         * Saves collection
         */
        function saveRefigure() {
            vm.loading = true;
            collections
                .save(vm.refigure)
                .then(function (refigure) {
                    rfToast.show('Refigure saved', refigure);
                    $scope.$emit('refigureUpdated', refigure);
                })
                .finally(function () {
                    vm.loading = false;
                });
        }

        function toggleDetails(index) {
            vm.opened = vm.opened === index ? -1 : index;
        }

        //////////////////////////////

        /**
         * @ngdoc method
         * @name refigureShared.services:collectionEditService#removeImage
         * @methodOf refigureShared.services:collectionEditService
         * @description
         * Removes image
         */
        function removeImage(index) {
            modalDialog
                .confirm('Delete this image?')
                .then(function () {
                    vm.refigure.Figures[index]._loading = true;
                    rfImages
                        .remove(vm.refigure.Figures[index].ID)
                        .then(function () {
                            vm.refigure.Figures.splice(index, 1);
                            vm.refigure.FiguresCount--;
                            $scope.$emit('refigureUpdated', {
                                ID: vm.refigure.ID,
                                FiguresCount: vm.refigure.FiguresCount
                            });
                            rfToast.show('Image removed');
                        }, function () {
                            vm.refigure.Figures[index]._loading = false;
                        });
                });
        }

        /**
         * @ngdoc method
         * @name refigureShared.services:collectionEditService#saveImage
         * @methodOf refigureShared.services:collectionEditService
         * @param {Number} index index of Image to save
         * @description
         * Edits image
         */
        function saveImage(index) {
            if (vm.refigure.ID && vm.forms['f' + index].$dirty) {
                vm.refigure.Figures[index]._loading = true;
                rfImages
                    .save(vm.refigure.Figures[index])
                    .finally(function () {
                        vm.refigure.Figures[index]._loading = false;
                    });
            }
        }
    }

})(window.angular);
