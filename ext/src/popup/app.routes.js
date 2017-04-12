(function (angular) {
    'use strict';

    angular.module('ReFigure')
        .config(ConfigController);

    ConfigController.$inject = ['$routeProvider'];

    function ConfigController($routeProvider) {
        $routeProvider
            .when('/', {
                config: {
                    name: 'main',
                    title: 'ReFigure'
                },
                template: '<main/>'
            })
            .when('/auth', {
                config: {
                    name: 'user',
                    title: 'User account'
                },
                template: '<login-form/>'
            })
            .when('/figure/edit/:id', {
                config: {
                    name: 'figureEdit',
                    title: 'Edit image'
                },
                template: '<figure-edit/>',
                resolveRedirectTo: IsAuthCtrl
            })
            .otherwise('/auth');

        IsAuthCtrl.$inject = ['AuthService'];

        function IsAuthCtrl(AuthService) {
            return AuthService.isAuth();
        }
    }

})(window.angular);
