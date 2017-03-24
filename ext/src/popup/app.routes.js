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
            .when('/collections/new', {
                template: '<collection-edit-form/>',
                resolveRedirectTo: IsAuthCtrl
            })
            .when('/collections/edit/:id', {
                template: '<collection-edit-form/>',
                resolveRedirectTo: IsAuthCtrl
            })
            .when('/collections/:id', {
                template: '<collection-details/>',
                resolveRedirectTo: IsAuthCtrl
            })
            .when('/my-collections', {
                template: '<collection-list/>',
                resolveRedirectTo: IsAuthCtrl
            })
            .when('/figure/edit/:id', {
                template: '<figure-edit/>'
            })
            .otherwise('/auth');

        IsAuthCtrl.$inject = ['AuthService'];

        function IsAuthCtrl(AuthService) {
            return AuthService.isAuth();
        }
    }

})(window.angular);