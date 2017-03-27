(function () {

    angular.module('ReFigure')
        .component('foundFigures', {
            templateUrl: 'view/foundFigures.component.html',
            controller: CtrlFunction,
            controllerAs: 'vm'
        });

    CtrlFunction.$inject = ['STORAGE', 'AuthService', 'CollectionSvc', '$http', '$location'];
    function CtrlFunction(STORAGE, AuthService, CollectionSvc, $http, $location) {
        let vm = this;
        vm.copy = angular.copy;
        vm.opened = -1;
        vm.figures = [];
        vm.onShowMoreInfo = onShowMoreInfo;
        vm.save = save;
        vm.$onInit = activate;

        function activate() {
            vm.figures = STORAGE.FOUND_FIGURES;
            vm.userInfo = AuthService.userInfo;
            getMyOwnCollections();
        }

        function onShowMoreInfo(index) {
            vm.opened = vm.opened === index ? -1 : index;
        }

        function getMyOwnCollections() {
            return CollectionSvc
                .getUserCollections()
                .then((res) => {
                    vm.collections = res.data.data.results;
                }, (error) => {
                    //error
                    console.log(error);
                    vm.error = error.data.message;
                });
        }

        function save(params){
           return $http
                .put(_gApiURL + "figure", params)
                .then((resp) => {
                  //  $location.path('/collections/' + resp.data.data);
                    console.log(resp.data.data);
                   // $location.path('/');
                });
        }
    }
})();
