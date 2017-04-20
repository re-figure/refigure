(function (angular) {

    angular.module('ReFigure')
        .factory('AuthService', Controller);

    Controller.$inject = ['$q', '$location', '$http', 'STORAGE', 'CookieToken'];

    function Controller($q, $location, $http, STORAGE, CookieToken) {
        //noinspection UnnecessaryLocalVariableJS
        var exports = {
            userInfo: STORAGE.userInfo,
            login: login,
            logout: logout,
            isAuth: isAuth
        };

        return exports;

        ////////////

        function logout() {
            STORAGE.userInfo.ID = null;
            STORAGE.Metapublication = null;
            chrome.storage.local.remove('userInfo');
            chrome.runtime.sendMessage({
                type: _gConst.MSG_TYPE_USER_LOGGED_OUT
            });
            CookieToken.remove();
            $location.path('/');
        }

        function login(params) {
            return $http
                .post(_gApiURL + 'login', params)
                .then(function (resp) {
                    if (resp.data.data) {
                        angular.extend(STORAGE.userInfo, resp.data.data);
                        STORAGE.Metapublication = null;
                        $location.path('/');
                        chrome.runtime.sendMessage({
                            type: _gConst.MSG_TYPE_USER_LOGGED_IN
                        });
                        chrome.storage.local.set({
                            userInfo: resp.data.data
                        });
                        CookieToken.set(STORAGE.userInfo.Token);
                    }
                    return resp.data.data;
                });
        }

        function isAuth() {
            var dfd = $q.defer();
            if (STORAGE.userInfo.ID) {
                dfd.resolve(undefined);
            } else {
                dfd.resolve('/');
            }
            return dfd.promise;
        }
    }

})(window.angular);
