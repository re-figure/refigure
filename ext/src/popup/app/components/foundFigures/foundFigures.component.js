(function () {

    angular.module('ReFigure')
        .component('foundFigures', {
            templateUrl: 'view/foundFigures.component.html',
            controller: CtrlFunction,
            controllerAs: 'vm'
        });

    CtrlFunction.$inject = ['STORAGE'];
    function CtrlFunction(STORAGE) {
        var vm = this;
        vm.figures = STORAGE.foundFigures;
        vm.opened = -1;
        vm.$onInit = activate;

        /////////////////////

        function activate() {}
    }
})();
