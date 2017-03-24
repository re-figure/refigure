(function () {

    angular.module('ReFigure')
        .component('foundFigures', {
            templateUrl: 'view/foundFigures.component.html',
            controller: CtrlFunction,
            controllerAs: 'vm'
        });

    CtrlFunction.$inject=["$scope", 'STORAGE', 'AuthService'];
    function CtrlFunction($scope, STORAGE, AuthService) {
        let vm = this;
        let currentIndex = -1;
        vm.figures = [];
        vm.onShowMoreInfo = show;
        vm.$onInit = activate;

        function activate() {
            vm.figures = STORAGE.FOUND_FIGURES;
            vm.figures.forEach(function(el){
                if(el.UserID === AuthService.userInfo.ID){
                    el.onClickable = true;
                }
             });
        }

        function show(index) {
            if (currentIndex < 0) {
                vm.figures[index].showMoreInfo = true;
                currentIndex = index;
            } else if (index === currentIndex) {
                vm.figures[index].showMoreInfo = !vm.figures[index].showMoreInfo;
            } else {
                vm.figures[currentIndex].showMoreInfo = false;
                vm.figures[index].showMoreInfo = true;
                currentIndex = index;
            }
        }
    }
})();
