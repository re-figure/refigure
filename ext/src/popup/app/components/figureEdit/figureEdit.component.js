(function () {

    angular.module('ReFigure')
        .component('figureEdit', {
            templateUrl: 'view/figureEdit.component.html',
            controller: CtrlFunction,
            controllerAs: 'vm'
        });

    CtrlFunction.$inject=["$routeParams", "STORAGE"];
    function CtrlFunction($routeParams, STORAGE) {
        let vm = this;
        vm.figure = {};
        vm.$onInit = activate;

        ////////////////////

        function activate() {
            vm.figure = STORAGE.FOUND_FIGURES.find(function(el){
                return el.ID === $routeParams.id;
            });
        }
    }
})();