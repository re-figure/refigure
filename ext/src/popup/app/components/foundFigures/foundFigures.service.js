(function (angular) {

    angular.module('ReFigure')
        .service('FoundFiguresSvc', FoundFiguresSvc);

    FoundFiguresSvc.$inject = ['$location', '$http', 'AuthService'];

    function FoundFiguresSvc($location, $http, AuthService) {
        var service = this;
        service.save = save;
        service.getUserCollections = getUserCollections;

        if (AuthService.userInfo) {
            $http.defaults.headers.common['Authentication'] = AuthService.userInfo.Token;
        } else {
            $http.defaults.headers.common['Authentication'] = undefined;
        }

        function save(params){
            return $http
                .put(_gApiURL + "figure", params);
        }

        function getUserCollections() {
            return $http
                .get(_gApiURL + "my-metapublications");
        }
    }

})(window.angular);
