(function () {

    angular.module('ReFigure')
        .component('foundFigures', {
            templateUrl: '/popup/components/foundFigures/foundFigures.html',
            controller: CtrlFunction,
            controllerAs: 'vm'
        });

    CtrlFunction.$inject=["$scope"];
    function CtrlFunction($scope) {
        var vm = this;
        vm.figures = [];
        activate();

        //////////////////////////

        vm.$onInit = function () {
            chrome.storage.local.get('rfFigures', function (data) {
                $scope.$apply(function() {
                    vm.figures = data.rfFigures;
                });
                console.log(vm.figures);
            });
          //  console.log(vm.figures);
        };

        function activate() {
            vm.qqq = 'dfgdfg';
        }
    }
})();
