(function (angular) {
    'use strict';

    angular.module('ReFigure')
        .component("collectionEditForm", {
            templateUrl: 'view/collectionEdit.component.html',
            controller: EditCollectionController,
            controllerAs: 'vm'
        });

    EditCollectionController.$inject = ['AuthService', 'CollectionSvc'];

    function EditCollectionController(AuthService, CollectionSvc) {
        var vm = this;

        vm.$onInit = activate;
        vm.editCollection = editCollection;
        vm.formData = {};
        vm.userInfo = AuthService.userInfo;

        ////////////////////////////

        function activate() {
        }

        function editCollection(params) {
            if (!params.ID) {
                params.UserID = vm.userInfo.ID;
                CollectionSvc.create(params);
            } else {
                delete params.Flagged;
                CollectionSvc.update(params);
            }
        }

    }

})(window.angular);
