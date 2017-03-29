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
        var vm = this;

        vm.$onInit = activate;
        vm.editCollection = editCollection;
        vm.formData = {};
        vm.error = '';

        ////////////////////////////

        function activate() {
            vm.userInfo = AuthService.userInfo;
            if ($routeParams.id) {
                vm.buttonName = 'Update';
                CollectionSvc.read($routeParams.id)
                    .then(function (resp) {
                        vm.formData = resp.data.data.Metapublication;
                    }, function (err) {
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
                    .catch(function (error) {
                        console.log(error);
                        vm.error = error.data.message;
                    });
            } else {
                delete params.Flagged;
                // console.log(params);
                CollectionSvc
                    .update(params)
                    .then(null, function (error) {
                        console.log(error);
                        vm.error = error.data.message;
                    });
            }
        }

    }

})(window.angular);
