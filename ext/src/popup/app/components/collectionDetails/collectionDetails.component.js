(function (angular) {
    'use strict';

    angular.module('ReFigure')
        .component("collectionDetails", {
            templateUrl: 'view/collectionDetails.component.html',
            controller: CollectionDetailsController,
            controllerAs: 'vm'
        });

    CollectionDetailsController.$inject = ['$routeParams', 'AuthService', 'CollectionSvc'];

    function CollectionDetailsController($routeParams, AuthService, CollectionSvc) {
        let vm = this;

        vm.$onInit = activate;
        vm.removeItem = removeItem;
        vm.error = '';

        ////////////////////////////

        function activate() {
            vm.userInfo = AuthService.userInfo;
            if ($routeParams.id) {
                CollectionSvc.read($routeParams.id)
                    .then((resp) => {
                        vm.collection = resp.data.data.Metapublication;
                        // console.log(vm.collection);
                    }, (err) => {
                        console.log(err);
                        vm.error = err.data.message;
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
    }

})(window.angular);
