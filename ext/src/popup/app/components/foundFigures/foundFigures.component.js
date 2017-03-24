(function () {

    angular.module('ReFigure')
        .component('foundFigures', {
            templateUrl: 'view/foundFigures.component.html',
            controller: CtrlFunction,
            controllerAs: 'vm'
        });

    CtrlFunction.$inject = ['STORAGE', 'AuthService'];
    function CtrlFunction(STORAGE, AuthService) {
        let vm = this;
        vm.opened = -1;
        vm.figures = [];
        vm.onShowMoreInfo = onShowMoreInfo;
        vm.$onInit = activate;

        function activate() {
            vm.figures = STORAGE.FOUND_FIGURES;
            vm.figures.forEach(function (el) {
                if (el.UserID === AuthService.userInfo.ID) {
                    el.isClickable = true;
                }
            });
        }

        function onShowMoreInfo(index) {
            vm.opened = vm.opened === index ? -1 : index;
        }
    }
})();
