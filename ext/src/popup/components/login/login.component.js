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

        LoginController.$inject = ['$scope', '$http', 'Authn'];
        function LoginController ($scope, $http, Authn) {
            let vm = this;

            vm.error = '';

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
                        // put userInfo object to parent controller
                        vm.userInfo({value: response.data.data});

                        // Set the token as header for requests
                        $http.defaults.headers.common['Authentication'] = response.data.data.Token;
                    },
                    function (error) {
                        //error
                        console.log(error);
                        chrome.storage.local.set({
                            userInfo: {}
                        });
                        // put Error object to parent controller
                        vm.userInfo({value: error});
                        vm.error = error.data.message;
                    }
                );
            };

            activate();

            ////////////////////////////

            vm.$onInit = function () {
                chrome.storage.local.get('userInfo', function (data) {
                    $scope.$apply(function() {
                        if (data.userInfo && data.userInfo.Token) {
                            vm.userInfo({value: data.userInfo});
                            $http.defaults.headers.common['Authentication'] = data.userInfo.Token;
                        }
                        // console.log('Got authn info from storage!');
                    });
                });
            };

            function activate() {
                vm.loginData = {email: 'blabla@test.org', password: 'Pa$$word'}; // TODO: test data, has to be removed!
            }

        }

})();
