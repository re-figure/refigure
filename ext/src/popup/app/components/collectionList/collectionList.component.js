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
        vm.metapublication = STORAGE.Metapublication;
        vm.userInfo = AuthService.userInfo;
        vm.search = '';

        ////////////////////////////

        function getMyOwnCollections() {
            return CollectionSvc
                .getUserCollections()
                .then(function (res) {
                    vm.collections = res.data.data.results;
                });
        }

        function activate() {
            AuthService.userInfo && getMyOwnCollections();
        }

        function editCollection(metapub) {
            chrome.storage.local.set({
                Metapublication: metapub
            }, function () {
                chrome.tabs.sendMessage(STORAGE.currentTab, {
                    type: _gConst.MSG_TYPE_ADD_START,
                    Metapublication: metapub
                });
                window.close();
            });
        }
    }

})(window.angular);
