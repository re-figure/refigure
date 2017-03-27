(function () {

    angular.module('ReFigure')
        .component('figureEdit', {
            templateUrl: 'view/figureEdit.component.html',
            controller: CtrlFunction,
            controllerAs: 'vm'
        });

    CtrlFunction.$inject = ['$http', '$location', '$routeParams', 'STORAGE', 'AuthService'];
    function CtrlFunction($http, $location, $routeParams, STORAGE, AuthService) {
        let vm = this;
        vm.figure = {};
        vm.$onInit = activate;
        vm.save = save;
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
                chrome.tabs.sendMessage(STORAGE.CURRENT_TAB, {
                    type: _gConst.MSG_TYPE_CREATE_IN_POPUP
                });
            }
        }

        function addCancel() {
            STORAGE.ADD_FIGURE = null;
            chrome.storage.local.remove('rfAddFigure');
            $location.path('/');
        }

        function save(){
            if (AuthService.userInfo) {
                $http.defaults.headers.common['Authentication'] = AuthService.userInfo.Token;
            } else {
                $http.defaults.headers.common['Authentication'] = undefined;
            }
            return $http
                .post(_gApiURL + "figure", vm.figure)
                .then(() => {
                    STORAGE.ADD_FIGURE = null;
                    chrome.storage.local.remove('rfAddFigure');
                    $location.path('/collections/edit/' + vm.figure.MetapublicationID);
                });
        }

    }
})();