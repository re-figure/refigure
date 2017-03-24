(function (angular) {
    'use strict';

    angular.module('ReFigure')
        .component("collectionList", {
            templateUrl: 'view/collectionList.component.html',
            controller: CollectionListController,
            controllerAs: 'vm'
        });

    CollectionListController.$inject = ['AuthService', 'CollectionSvc'];

    function CollectionListController(AuthService, CollectionSvc) {
        let vm = this;

        vm.$onInit = activate;
        vm.removeItem = removeItem;
        vm.error = '';

        ////////////////////////////

        function getMyOwnCollections() {
            return CollectionSvc
                .getUserCollections()
                .then((res) => {
                    vm.collections = res.data.data.results;
                }, (error) => {
                    //error
                    console.log(error);
                    vm.error = error.data.message;
                });
        }

        function activate() {
            vm.userInfo = AuthService.userInfo;
            getMyOwnCollections();
        }

        function removeItem(id) {
            if (id) {
                CollectionSvc.delete(id)
                    .catch((err) => {
                        console.log(err);
                        vm.error = err.data.message;
                    });
            }
        }
    }

})(window.angular);
