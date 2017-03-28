(function (angular) {
    'use strict';

    angular.module('ReFigure')
        .component("loginForm", {
            templateUrl: 'view/login.component.html',
            controller: LoginController,
            controllerAs: 'vm'
        });

    LoginController.$inject = ['AuthService'];

    function LoginController(AuthService) {
        var vm = this;

        vm.login = login;
        vm.logout = logout;
        vm.$onInit = activate;
        vm.error = '';

        ////////////////////////////

        function login(params) {
            AuthService
                .login(params, setUserInfo)
                .catch(function (error) {
                    console.log(error);
                    vm.error = error.data.message;
                });
        }

        function logout() {
            AuthService
                .logout();
            vm.userInfo = AuthService.userInfo;
        }
        
        function setUserInfo() {
            vm.userInfo = AuthService.userInfo;
        }

        function activate() {
            vm.userInfo = AuthService.userInfo;
            //TODO: fake testing account, remove this
            vm.loginData = {
                Email: 'blabla@test.org',
                Password: 'Pa$$word'
            };
        }
    }

})(window.angular);
