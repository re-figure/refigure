(function (angular) {
    'use strict';

    angular.module('ReFigure')
        .component("createCollectionForm", {
            templateUrl: 'view/createCollection.component.html',
            controller: CreateCollectionController,
            controllerAs: 'vm'
        });

    CreateCollectionController.$inject = ['AuthService', 'CollectionSvc'];

    function CreateCollectionController(AuthService, CollectionSvc) {
        let vm = this;

        vm.$onInit = activate;
        vm.createCollection = createCollection;
        vm.error = '';

        ////////////////////////////

        function createCollection(params) {
            params.UserID = vm.userInfo.ID;
            // params.Type = 0;
            // params.Flags = 0;
            // params.Flagged = 0;
            CollectionSvc
                .create(params)
                .then(null, (error) => {
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
