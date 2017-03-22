(function () {

    angular.module('ReFigure')
        .component('foundFigures', {
            templateUrl: 'view/foundFigures.component.html',
            controller: CtrlFunction,
            controllerAs: 'vm'
        });

    CtrlFunction.$inject=["$scope"];
    function CtrlFunction($scope) {
        var vm = this;
        vm.figures = [];
        vm.onShowMoreInfo = show;
        var currentIndex = -1;
   //     activate();

        //////////////////////////

        vm.$onInit = function () {
            chrome.storage.local.get('rfFigures', function (data) {
                $scope.$apply(function() {
                    vm.figures = data.rfFigures;
                });
            });
        };

        function show(index) {
            if (currentIndex < 0) {
                vm.figures[index].showMoreInfo = true;
                currentIndex = index;
            }
            else if (index == currentIndex) {
                vm.figures[index].showMoreInfo = !vm.figures[index].showMoreInfo;
            }
            else {
                vm.figures[currentIndex].showMoreInfo = false;
                vm.figures[index].showMoreInfo = true;
                currentIndex = index;
                //if(index > currentIndex){
                //   window.scrollIntoView(element);
                // }
            }
        }
     }

})();
