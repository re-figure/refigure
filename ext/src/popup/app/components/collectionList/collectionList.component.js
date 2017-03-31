(function (angular) {
    'use strict';

    angular.module('ReFigure')
        .component("collectionList", {
            templateUrl: 'view/collectionList.component.html',
            controller: CollectionListController,
            controllerAs: 'vm'
        });

    CollectionListController.$inject = ['AuthService', 'CollectionSvc', 'STORAGE', 'MessageService'];

    function CollectionListController(AuthService, CollectionSvc, STORAGE, MessageService) {
        var vm = this;

        vm.$onInit = activate;
        vm.editCollection = editCollection;
        vm.metapublication = STORAGE.Metapublication;
        vm.userInfo = AuthService.userInfo;
        vm.showFull = showFull;
        vm.search = '';

        ////////////////////////////

        function getMyOwnCollections() {
            return CollectionSvc
                .getUserCollections()
                .then(function (res) {
                    var arr = res.data.data.results;
                    // try to put the currently selected collection on top
                    // if the current collection is not found in results then clear selection
                    if (vm.metapublication) {
                        var idx = arr.findIndex(function(elem) {
                            return (elem.Metapublication.ID === vm.metapublication.ID);
                        });
                        if (idx > 0) {
                            arr.unshift(arr.splice(idx, 1)[0]);
                        } else if (idx !== 0) {
                            // if the selected collection is not found then clear selection
                            vm.metapublication = null;
                            STORAGE.Metapublication = null;
                        }
                    }
                    vm.collections = arr;
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

        function showFull(event, src) {
            event.stopPropagation();
            MessageService.showWindow({
                content: '<img src="'+src+'">'
            });
        }
    }

})(window.angular);
