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
            .when('/new-collection', {
                template: '<create-collection-form/>',
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