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
        vm.error = '';

        ////////////////////////////

        function getMyOwnCollections() {
            return CollectionSvc
                .getUserCollections()
                .then((res) => {
                    vm.collections = res.data.data.results;
                    console.log("My Collections: ", vm.collections);
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
    }

})(window.angular);
