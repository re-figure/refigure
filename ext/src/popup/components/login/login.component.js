(function () {
    'use strict';

    angular.module('ReFigure')
        .component("loginForm", {
            templateUrl: 'view/loginForm.component.html',
            controller: LoginController,
            controllerAs: 'vm',
            bindings: {
                userInfo: "&"
            }
        });

        LoginController.$inject = ['$scope', 'Authn'];
        function LoginController ($scope, Authn) {
            let vm = this;

            vm.login = function (loginData) {
                Authn.login(loginData).then(
                    function(response) {
                        //success
                        console.log(response.data.data);
                        chrome.storage.local.set({
                            userInfo: response.data.data
                        });
                        chrome.runtime.sendMessage({
                            type: _gConst.MSG_TYPE_USER_LOGGED_IN
                        });
                        vm.userInfo({value: response.data.data});
                    },
                    function (error) {
                        //error
                        console.log(error);
                    }
                );
            };

            activate();

            ////////////////////////////

            vm.$onInit = function () {
                chrome.storage.local.get('userInfo', function (data) {
                    $scope.$apply(function() {
                        if (data.userInfo) {
                            vm.userInfo({value: data.userInfo});
                        }
                        // console.log('Got authn info from storage!');
                    });
                });
            };

            function activate() {
                vm.loginData = {email: 'blabla@test.org', password: 'Pa$$word'};
            }

        }

})();
