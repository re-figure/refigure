(function () {
    'use strict';

    angular.module('ReFigure')
        .service('Authn', AuthnService);

    AuthnService.$inject = ['$http'];
    function AuthnService($http) {
        var authenticate = this;

        authenticate.login = function (loginData) {
            return $http.post(_gApiURL + "login", { Email: loginData.email, Password: loginData.password });
        };
    }

})();
