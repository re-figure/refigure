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
                .post(_gApiURL + "metapublication", params)
                .then((resp) => {
                    return resp.data;
                });
        };
    }

})(window.angular);
