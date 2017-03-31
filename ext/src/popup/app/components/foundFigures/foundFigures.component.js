(function () {

    angular.module('ReFigure')
        .component('foundFigures', {
            templateUrl: 'view/foundFigures.component.html',
            controller: CtrlFunction,
            controllerAs: 'vm'
        });

    CtrlFunction.$inject = ['STORAGE', 'MessageService'];
    function CtrlFunction(STORAGE, MessageService) {
        var vm = this;
        vm.figures = STORAGE.foundFigures;
        vm.opened = -1;
        vm.$onInit = activate;
        vm.showFull = showFull;

        /////////////////////

        function activate() {}

        function showFull(src) {
            MessageService.showWindow({
                content: '<img src="'+src+'">'
            });
        }
    }
})();
