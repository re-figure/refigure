(function () {

    angular.module('ReFigure')
        .component('figureEdit', {
            templateUrl: 'view/figureEdit.component.html',
            controller: CtrlFunction,
            controllerAs: 'vm'
        });

    CtrlFunction.$inject = ['$location', '$routeParams', 'STORAGE'];
    function CtrlFunction($location, $routeParams, STORAGE) {
        let vm = this;
        vm.figure = {};
        vm.$onInit = activate;
        vm.addCancel = addCancel;

        ////////////////////

        function activate() {
            if ($routeParams.id) {
                //edit
                vm.figure = STORAGE.FOUND_FIGURES.find(function (el) {
                    return el.ID === $routeParams.id;
                });
            } else {
                //create
                vm.figure = STORAGE.ADD_FIGURE;
                chrome.runtime.sendMessage({
                    type: _gConst.MSG_TYPE_CREATE_IN_POPUP
                });
            }
        }

        function addCancel() {
            STORAGE.ADD_FIGURE = null;
            chrome.storage.local.remove('rfAddFigure');
            $location.path('/');
        }
    }
})();