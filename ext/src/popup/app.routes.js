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
            .when('/collections/new', {
                config: {
                    name: 'collectionNew',
                    title: 'Create refigure'
                },
                template: '<collection-edit-form/>',
                resolveRedirectTo: IsAuthCtrl
            })
            .when('/collections/edit/:id', {
                config: {
                    name: 'collectionEdit',
                    title: 'Edit refigure'
                },
                template: '<collection-edit-form/>',
                resolveRedirectTo: IsAuthCtrl
            })
            .when('/figure/edit/:id', {
                config: {
                    name: 'figureEdit',
                    title: 'Edit image'
                },
                template: '<figure-edit/>',
                resolveRedirectTo: IsAuthCtrl
            })
            .when('/foundfigures', {
                config: {
                    name: 'figureEdit',
                    title: 'Found images'
                },
                template: '<found-figures/>'
            })
            .otherwise('/auth');

        IsAuthCtrl.$inject = ['AuthService'];

        function IsAuthCtrl(AuthService) {
            return AuthService.isAuth();
        }
    }

})(window.angular);
