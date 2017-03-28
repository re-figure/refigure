(function (angular) {
    'use strict';

    angular.module('ReFigure')
        .component("collectionEditForm", {
            templateUrl: 'view/collectionEdit.component.html',
            controller: EditCollectionController,
            controllerAs: 'vm'
        });

    EditCollectionController.$inject = ['$routeParams', 'AuthService', 'CollectionSvc', 'STORAGE'];

    function EditCollectionController($routeParams, AuthService, CollectionSvc, STORAGE) {
        var vm = this;

        vm.$onInit = activate;
        vm.editCollection = editCollection;
        vm.formData = {};
        vm.removeItem = removeItem;
        vm.toggleFlag = toggleFlag;
        vm.error = '';
        vm.buttonName = 'Create';
        vm.figureAddStart = figureAddStart;

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
                    .then(null, function (error) {
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

        function removeItem(id) {
            if (id && confirm("Are you sure?")) {
                CollectionSvc.delete(id)
                    .catch(function (err) {
                        console.log(err);
                        vm.error = err.data.message;
                    });
            }
        }

        function toggleFlag() {
            vm.formData.Flag = !vm.formData.Flag;
            CollectionSvc.toggleFlag({ID: vm.formData.ID, Flagged: vm.formData.Flagged})
                .catch(function (err) {
                    console.log(err);
                    vm.error = err.data.message;
                });
        }

        function figureAddStart() {
            vm.error = '';
            chrome.tabs.sendMessage(STORAGE.CURRENT_TAB, {
                type: _gConst.MSG_TYPE_ADD_START,
                metapublicationId: vm.formData.ID
            });
            window.close();
        }
    }

})(window.angular);
