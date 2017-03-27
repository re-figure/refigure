(function (angular) {
    'use strict';

    angular.module('ReFigure')
        .component("collectionEditForm", {
            templateUrl: 'view/collectionEdit.component.html',
            controller: EditCollectionController,
            controllerAs: 'vm'
        });

    EditCollectionController.$inject = ['$routeParams', 'AuthService', 'CollectionSvc'];

    function EditCollectionController($routeParams, AuthService, CollectionSvc) {
        let vm = this;

        vm.$onInit = activate;
        vm.editCollection = editCollection;
        vm.formData = {};
        vm.removeItem = removeItem;
        vm.toggleFlag = toggleFlag;
        vm.error = '';
        vm.buttonName = 'Create';

        ////////////////////////////

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
                delete params.Flagged;
                // console.log(params);
                CollectionSvc
                    .update(params)
                    .then(null, (error) => {
                        console.log(error);
                        vm.error = error.data.message;
                    });
            }
        }

        function removeItem(id) {
            if (id && confirm("Are you sure?")) {
                CollectionSvc.delete(id)
                    .catch((err) => {
                        console.log(err);
                        vm.error = err.data.message;
                    });
            }
        }

        function toggleFlag() {
            vm.formData.Flag = !vm.formData.Flag;
            // console.log(vm.formData.Flag);
            CollectionSvc.toggleFlag({ID: vm.formData.ID, Flagged: vm.formData.Flagged})
                .catch((err) => {
                    console.log(err);
                    vm.error = err.data.message;
                });
        }
    }

})(window.angular);
