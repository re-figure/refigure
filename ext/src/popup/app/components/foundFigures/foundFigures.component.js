(function () {

    angular.module('ReFigure')
        .component('foundFigures', {
            templateUrl: 'view/foundFigures.component.html',
            controller: CtrlFunction,
            controllerAs: 'vm'
        });

    CtrlFunction.$inject=["$scope"];
    function CtrlFunction($scope) {
        let vm = this;
        vm.figures = [];
        vm.onShowMoreInfo = show;
        let currentIndex = -1;

   //     activate();

        //////////////////////////

        vm.$onInit = function () {
            chrome.runtime.onMessage.addListener(
                function(request, sender, sendResponse) {
                    if (request.type === _gConst.MSG_TYPE_CHECK_COMPLETED) {
                        $scope.$apply(function() {
                            vm.figures = request.figures;
                        });
                    }
                    return true;
                }
            );
            chrome.storage.local.get('foundFigures', function (data) {
                $scope.$apply(function() {
                    vm.figures = data.foundFigures;
                });
            });
        };

        function show(index) {
            if (currentIndex < 0) {
                vm.figures[index].showMoreInfo = true;
                currentIndex = index;
            }
            else if (index === currentIndex) {
                vm.figures[index].showMoreInfo = !vm.figures[index].showMoreInfo;
            }
            else {
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
