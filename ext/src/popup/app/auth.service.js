(function (angular) {

    angular.module('ReFigure')
        .factory('AuthService', Controller);

    Controller.$inject = ['$rootScope', '$q', '$location', '$http'];

    function Controller($rootScope, $q, $location, $http) {
        //noinspection UnnecessaryLocalVariableJS
        let userInfo = null,
            exports = {
                login: login,
                logout: logout,
                isAuth: isAuth
            };

        return exports;

        ////////////

        function logout() {
            userInfo = null;
            $location.path('/auth');
            chrome.runtime.sendMessage({
                type: _gConst.MSG_TYPE_USER_LOGGED_OUT
            });
        }

        function login(params) {
            return $http
                .post(_gApiURL + "login", params)
                .then((resp) => {
                    if (resp.data.data) {
                        userInfo = resp.data.data;
                        $location.path('/');
                        chrome.runtime.sendMessage({
                            type: _gConst.MSG_TYPE_USER_LOGGED_IN
                        });
                        chrome.storage.local.set({
                            userInfo: resp.data.data
                        });
                    }
                    return resp.data.data;
                });
        }

        function isAuth() {
            let dfd = $q.defer();
            if (userInfo !== null) {
                dfd.resolve(undefined);
            } else {
                chrome.storage.local.get('userInfo', (data) => {
                    let resolve = '/auth';
                    if (data.userInfo) {
                        userInfo = data.userInfo;
                        resolve = undefined;
                    }
                    dfd.resolve(resolve);
                });
            }
            return dfd.promise;
        }
    }

})(window.angular);