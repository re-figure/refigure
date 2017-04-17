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

    EditController.$inject = ['collectionEditService'];

    function EditController(collectionEditService) {
        var vm = this;

        vm.svc = collectionEditService;

        /////////////////////////////////

    }

})(window.angular);
