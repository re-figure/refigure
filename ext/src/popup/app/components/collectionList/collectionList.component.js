(function (angular) {
    'use strict';

    angular.module('ReFigure')
        .component("collectionList", {
            templateUrl: 'view/collectionList.component.html',
            controller: CollectionListController,
            controllerAs: 'vm'
        });

    CollectionListController.$inject = ['AuthService', 'CollectionSvc', 'STORAGE'];

    function CollectionListController(AuthService, CollectionSvc, STORAGE) {
        var vm = this;

        vm.$onInit = activate;
        vm.editCollection = editCollection;
        vm.search = '';
        vm.error = '';

        ////////////////////////////

        function getMyOwnCollections() {
            return CollectionSvc
                .getUserCollections()
                .then(function (res) {
                    vm.collections = res.data.data.results;
                }, function (error) {
                    //error
                    console.log(error);
                    vm.error = error.data.message;
                });
        }

        function activate() {
            vm.userInfo = AuthService.userInfo;
            AuthService.userInfo && getMyOwnCollections();
        }

        function editCollection(metapub) {
            chrome.storage.local.set({
                Metapublication: metapub
            }, function () {
                chrome.tabs.sendMessage(STORAGE.CURRENT_TAB, {
                    type: _gConst.MSG_TYPE_ADD_START,
                    Metapublication: metapub
                });
                window.close();
            });
        }

    }

})(window.angular);
