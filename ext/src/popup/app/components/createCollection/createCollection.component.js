(function (angular) {
    'use strict';

    angular.module('ReFigure')
        .component("createCollectionForm", {
            templateUrl: 'view/createCollection.component.html',
            controller: CreateCollectionController,
            controllerAs: 'vm'
        });

    CreateCollectionController.$inject = ['$location', 'AuthService', 'CollectionSvc'];

    function CreateCollectionController($location, AuthService, CollectionSvc) {
        let vm = this;

        vm.$onInit = activate;
        vm.createCollection = createCollection;
        vm.error = '';

        ////////////////////////////

        function createCollection(params) {
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
        }

        function activate() {
            vm.userInfo = AuthService.userInfo;
        }
    }

})(window.angular);
