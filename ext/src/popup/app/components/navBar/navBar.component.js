(function (angular) {
    'use strict';

    angular.module('ReFigure')
        .component('navBar', {
            controller: Controller,
            controllerAs: 'vm',
            templateUrl: 'view/navBar.component.html'
        });


    Controller.$inject = ['$scope', '$window', 'AuthService', 'STORAGE'];

    function Controller($scope, $window, AuthService, STORAGE) {
        let vm = this;
        vm.$onInit = activate;
        vm.logout = AuthService.logout;
        vm.auth = AuthService;
        vm.store = STORAGE;
        vm.historyBack = historyBack;

        //////////////////

        function activate() {
            $scope.$on('$routeChangeSuccess', function ($event, $curr) {
                vm.page = $curr.$$route.config;
                vm.userInfo = AuthService.userInfo;
            });
        }

        function historyBack() {
            $window.history.back();
        }
    }

})(window.angular);
