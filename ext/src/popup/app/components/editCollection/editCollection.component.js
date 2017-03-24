(function (angular) {
    'use strict';

    angular.module('ReFigure')
        .component("editCollectionForm", {
            templateUrl: 'view/editCollection.component.html',
            controller: EditCollectionController,
            controllerAs: 'vm'
        });

    EditCollectionController.$inject = ['$location', '$routeParams', 'AuthService', 'CollectionSvc'];

    function EditCollectionController($location, $routeParams, AuthService, CollectionSvc) {
        let vm = this;

        vm.$onInit = activate;
        vm.editCollection = editCollection;
        vm.error = '';
        vm.buttonName = 'Create';

        ////////////////////////////

        function editCollection(params) {
            if (!params.ID) {
                params.UserID = vm.userInfo.ID;

                CollectionSvc
                    .create(params)
                    .then((resp) => {
                        console.log(resp.data);
                        $location.path('/');
                    }, (error) => {
                        //error
                        console.log(error);
                        vm.error = error.data.message;
                    });
            } else {
                CollectionSvc
                    .update(params)
                    .then((resp) => {
                        console.log(resp.data);
                        $location.path('/my-collections');
                    }, (error) => {
                        //error
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
                    })
            }
        }
    }

})(window.angular);
