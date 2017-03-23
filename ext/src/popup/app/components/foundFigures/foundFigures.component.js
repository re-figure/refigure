(function () {

    angular.module('ReFigure')
        .component('foundFigures', {
            templateUrl: 'view/foundFigures.component.html',
            controller: CtrlFunction,
            controllerAs: 'vm'
        });

    CtrlFunction.$inject=["$scope", 'STORAGE'];
    function CtrlFunction($scope, STORAGE) {
        let vm = this;
        vm.figures = [];
        vm.onShowMoreInfo = show;
        let currentIndex = -1;

   //     activate();

        //////////////////////////

        vm.$onInit = function () {
            vm.figures = STORAGE.FOUND_FIGURES;
        };

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
                //if(index > currentIndex){
                //   el.scrollIntoView(element);
                // }
            }
        }
     }

})();
