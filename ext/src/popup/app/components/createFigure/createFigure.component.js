(function (angular) {

    angular.module('ReFigure')
        .component('createFigure', {
            controller: Controller,
            controllerAs: 'vm',
            templateUrl: 'view/createFigure.component.html'
        });


    Controller.$inject = ['$scope'];

    function Controller($scope) {
        let vm = this;

        vm.$onInit = activate;

        //////////////////

         function activate() {

        }
    }

})(window.angular);
