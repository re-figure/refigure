(function (angular) {
    'use strict';

    angular.module('ReFigure')
        .component("editCollectionForm", {
            templateUrl: 'view/editCollection.component.html',
            controller: EditCollectionController,
            controllerAs: 'vm'
        });

    EditCollectionController.$inject = ['$routeParams', 'AuthService', 'CollectionSvc'];

    function EditCollectionController($routeParams, AuthService, CollectionSvc) {
        let vm = this;

        vm.$onInit = activate;
        vm.editCollection = editCollection;
        vm.formData = {};
        vm.error = '';
        vm.buttonName = 'Create';

        ////////////////////////////

        function editCollection(params) {
            if (!params.ID) {
                params.UserID = vm.userInfo.ID;

                CollectionSvc
                    .create(params)
                    .then(null, (error) => {
                        console.log(error);
                        vm.error = error.data.message;
                    });
            } else {
                CollectionSvc
                    .update(params)
                    .then(null, (error) => {
                        console.log(error);
                        vm.error = error.data.message;
                    });
            }
        }

        function activate() {
            vm.userInfo = AuthService.userInfo;
            if ($routeParams.id) {
                vm.buttonName = 'Update';
                CollectionSvc.read($routeParams.id)
                    .then((resp) => {
                        vm.formData = resp.data.data.Metapublication;
                    }, (err) => {
                        console.log(err);
                        vm.error = err.data.message;
                    });
            }
        }
    }

})(window.angular);
