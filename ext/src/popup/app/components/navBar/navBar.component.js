(function (angular) {

    angular.module('ReFigure')
        .component('navBar', {
            controller: Controller,
            controllerAs: 'vm',
            templateUrl: 'view/navBar.component.html'
        });


    Controller.$inject = ['$scope', 'AuthService', 'STORAGE'];

    function Controller($scope, AuthService, STORAGE) {
        let vm = this;
        vm.$onInit = activate;
        vm.logout = AuthService.logout;
        vm.store = STORAGE;

        //////////////////

        function activate() {
            $scope.$on('$routeChangeSuccess', function () {
                vm.userInfo = AuthService.userInfo;
            });
        }
    }

})(window.angular);
