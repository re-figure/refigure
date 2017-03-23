(function (angular) {

    angular.module('ReFigure')
        .config(ConfigController);

    ConfigController.$inject = ['$routeProvider'];

    function ConfigController($routeProvider) {
        $routeProvider
            .when('/', {
                template: '<main/>',
                resolveRedirectTo: IsAuthCtrl
            })
            .when('/auth', {
                template: '<login-form/>'
            })
            .when('/collections/:id/edit', {
                template: '<edit-collection-form/>',
                resolveRedirectTo: IsAuthCtrl
            })
            .when('/collections/new', {
                template: '<edit-collection-form/>',
                resolveRedirectTo: IsAuthCtrl
            })
            .when('/my-collections', {
                template: '<collection-list/>',
                resolveRedirectTo: IsAuthCtrl
            })
            .otherwise('/auth');

        IsAuthCtrl.$inject = ['AuthService'];

        function IsAuthCtrl(AuthService) {
            return AuthService.isAuth();
        }
    }

})(window.angular);