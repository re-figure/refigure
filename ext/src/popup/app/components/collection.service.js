(function (angular) {

    angular.module('ReFigure')
        .service('CollectionSvc', CollectionService);

    CollectionService.$inject = ['$http', 'AuthService'];

    function CollectionService($http, AuthService) {
        let service = this;

        if (AuthService.userInfo) {
            $http.defaults.headers.common['Authentication'] = AuthService.userInfo.Token;
        } else {
            $http.defaults.headers.common['Authentication'] = undefined;
        }

        service.create = function (params) {
            return $http
                .post(_gApiURL + "metapublication", params);
        };

        service.read = function (id) {
            return $http
                .get(_gApiURL + "metapublication/" + id);
        };

        service.update = function (params) {
            return $http
                .put(_gApiURL + "metapublication", params);
        };

        service.getUserCollections = function () {
            return $http
                .get(_gApiURL + "my-metapublications");
        };

    }

})(window.angular);
