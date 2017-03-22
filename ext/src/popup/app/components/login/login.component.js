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
        let vm = this;

        vm.login = login;
        vm.$onInit = activate;
        vm.error = '';

        ////////////////////////////

        function login(params) {
            AuthService
                .login(params)
                .then(angular.noop, (error) => {
                    //error
                    console.log(error);
                    // put Error object into parent controller
                    vm.error = error.data.message;
                })
        }

        function activate() {
            //TODO: fake testing account, remove this
            vm.loginData = {
                Email: 'blabla@test.org',
                Password: 'Pa$$word'
            };
        }
    }

})(window.angular);
