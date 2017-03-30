(function (angular) {

    angular.module('ReFigure')
        .component('messages', {
            controller: Controller,
            controllerAs: 'vm',
            templateUrl: 'view/messages.component.html'
        });


    Controller.$inject = ['MessageService'];

    function Controller(MessageService) {
        var vm = this;
        vm.svc = MessageService;
    }

})(window.angular);
