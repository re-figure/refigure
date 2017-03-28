(function () {

    angular.module('ReFigure')
        .component('foundFigures', {
            templateUrl: 'view/foundFigures.component.html',
            controller: CtrlFunction,
            controllerAs: 'vm'
        });

    CtrlFunction.$inject = ['STORAGE', 'AuthService', 'FoundFiguresSvc'];
    function CtrlFunction(STORAGE, AuthService, FoundFiguresSvc) {
        var vm = this;
        vm.figures = [];
        vm.userInfo = {};
        vm.opened = -1;
        vm.save = save;
        vm.copy = angular.copy;
        vm.$onInit = activate;

        function activate() {
            vm.figures = STORAGE.FOUND_FIGURES;
            vm.userInfo = AuthService.userInfo;
        }

        function save(index, params) {
            FoundFiguresSvc.save(params)
                .then((resp) => {
                    vm.figures[index] = resp.data.data.Figure;
                 });
        }
    }
})();
