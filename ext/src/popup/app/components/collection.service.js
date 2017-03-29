(function (angular) {

    angular.module('ReFigure')
        .service('CollectionSvc', CollectionService);

    CollectionService.$inject = ['$location', '$http', 'AuthService', 'STORAGE'];

    function CollectionService($location, $http, AuthService, STORAGE) {
        var service = this;

        if (AuthService.userInfo) {
            $http.defaults.headers.common['Authentication'] = AuthService.userInfo.Token;
        } else {
            $http.defaults.headers.common['Authentication'] = undefined;
        }

        service.create = function (params) {
            return $http
                .post(_gApiURL + "metapublication", params)
                .then(function (resp) {
                    STORAGE.CURRENT_METAPUBLICATION = resp.data.data.Metapublication;
                    chrome.storage.local.set({
                        Metapublication: resp.data.data.Metapublication
                    });
                    $location.path('/');
                });
        };

        service.read = function (id) {
            return $http
                .get(_gApiURL + "metapublication/" + id);
        };

        service.update = function (params) {
            return $http
                .put(_gApiURL + "metapublication", params)
                .then(function (resp) {
                    // $location.path('/collections/' + resp.data.data.Metapublication.ID);
                    $location.path('/');
                });
        };

        service.delete = function (id) {
            return $http
                .delete(_gApiURL + "metapublication/" + id)
                .then(function () {
                    $location.path('/');
                });
        };

        service.getUserCollections = function () {
            return $http
                .get(_gApiURL + "my-metapublications");
        };

        service.toggleFlag = function (params) {
            return $http
                .put(_gApiURL + "metapublication-flag", params);
        }

    }

})(window.angular);
