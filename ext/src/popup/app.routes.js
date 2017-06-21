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
                    title: 'Refigure'
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
            .otherwise('/auth');
    }

})(window.angular);
