(function (angular) {

    angular.module('ReFigure')
        .component('main', {
            controller: Controller,
            controllerAs: 'vm',
            templateUrl: 'view/main.component.html'
        });


    Controller.$inject = ['STORAGE'];

    function Controller(STORAGE) {
        var vm = this;

        vm.$onInit = activate;

        //////////////////

        function activate() {
            vm.store = STORAGE;
        }
    }

})(window.angular);
