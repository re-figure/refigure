(function () {

    angular.module('ReFigure')
        .component('foundFigures', {
            templateUrl: '/popup/components/foundFigures/foundFigures.html',
            controller: CtrlFunction,
            controllerAs: 'vm'
        });

    function CtrlFunction() {
        var vm = this;
        vm.qqq = '';

        activate();

        //////////////////////////

        function activate() {
            vm.qqq = 'dfgdfg';
        }
    }
})();
