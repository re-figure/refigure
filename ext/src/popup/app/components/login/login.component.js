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
        vm.$onInit = activate;
        vm.error = '';

        ////////////////////////////

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
