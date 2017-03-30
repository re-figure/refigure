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

        vm.login = AuthService.login;
        vm.logout = AuthService.logout;
        vm.auth = AuthService;
        vm.userInfo = AuthService.userInfo;

        vm.$onInit = activate;

        ////////////////////////////

        function activate() {
            //TODO: fake testing account, remove this
            vm.loginData = {
                Email: 'blabla@test.org',
                Password: 'Pa$$word'
            };
        }
    }

})(window.angular);
