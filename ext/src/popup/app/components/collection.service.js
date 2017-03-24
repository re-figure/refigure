(function (angular) {

    angular.module('ReFigure')
        .service('CollectionSvc', CollectionService);

    CollectionService.$inject = ['$location', '$http', 'AuthService'];

    function CollectionService($location, $http, AuthService) {
        let service = this;

        if (AuthService.userInfo) {
            $http.defaults.headers.common['Authentication'] = AuthService.userInfo.Token;
        } else {
            $http.defaults.headers.common['Authentication'] = undefined;
        }

        service.create = function (params) {
            return $http
                .post(_gApiURL + "metapublication", params)
                .then((resp) => {
                    $location.path('/collections/' + resp.data.data.Metapublication.ID);
                });
        };

        service.read = function (id) {
            return $http
                .get(_gApiURL + "metapublication/" + id);
        };

        service.update = function (params) {
            return $http
                .put(_gApiURL + "metapublication", params)
                .then((resp) => {
                    $location.path('/collections/' + resp.data.data.Metapublication.ID);
                });
        };

        service.delete = function (id, cb, idx) {
            return $http
                .delete(_gApiURL + "metapublication/" + id)
                .then(() => {
                    if (cb) {cb(idx);}
                    $location.path('/my-collections');
                });
        };

        service.getUserCollections = function () {
            return $http
                .get(_gApiURL + "my-metapublications");
        };

    }

})(window.angular);
