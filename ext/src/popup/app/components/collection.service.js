(function (angular) {

    angular.module('ReFigure')
        .service('CollectionSvc', CollectionService);

    CollectionService.$inject = ['$location', '$http', 'AuthService', 'STORAGE'];

    function CollectionService($location, $http, AuthService, STORAGE) {
        var service = this;

        service.create = function (params) {
            setHeaders();
            return $http
                .post(_gApiURL + "metapublication", params)
                .then(function (resp) {
                    STORAGE.Metapublication = resp.data.data.Metapublication;
                    chrome.storage.local.set({
                        Metapublication: resp.data.data.Metapublication
                    });
                    $location.path('/');
                });
        };

        service.read = function (id) {
            setHeaders();
            return $http
                .get(_gApiURL + "metapublication/" + id);
        };

        service.update = function (params) {
            setHeaders();
            return $http
                .put(_gApiURL + "metapublication", params)
                .then(function (resp) {
                    // $location.path('/collections/' + resp.data.data.Metapublication.ID);
                    $location.path('/');
                });
        };

        service.delete = function (id) {
            setHeaders();
            return $http
                .delete(_gApiURL + "metapublication/" + id)
                .then(function () {
                    $location.path('/');
                });
        };

        service.getUserCollections = function () {
            setHeaders();
            return $http
                .get(_gApiURL + "my-metapublications");
        };

        service.toggleFlag = function (params) {
            setHeaders();
            return $http
                .put(_gApiURL + "metapublication-flag", params);
        };

        function setHeaders() {
            if (AuthService.userInfo) {
                $http.defaults.headers.common['Authentication'] = AuthService.userInfo.Token;
            } else {
                $http.defaults.headers.common['Authentication'] = undefined;
            }
        }

    }

})(window.angular);
