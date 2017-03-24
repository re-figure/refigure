(function () {

    angular.module('ReFigure')
        .component('editFigure', {
            templateUrl: 'view/editFigure.component.html',
            controller: CtrlFunction,
            controllerAs: 'vm'
        });

    CtrlFunction.$inject=["$routeParams", "STORAGE"];
    function CtrlFunction($routeParams, STORAGE) {
        let vm = this;
        vm.figure = {};
        vm.$onInit = activate;

        function activate() {
            let id = $routeParams.id;
            let figures = STORAGE.FOUND_FIGURES;
            vm.figure = figures.find(function(el){
                return el.ID === id;
            });
        }
    }
})();