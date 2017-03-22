(function (angular) {

    angular.module('ReFigure')
        .factory('AuthService', Controller);

    Controller.$inject = ['$q', '$location', '$http'];

    function Controller($q, $location, $http) {
        let exports = {
                userInfo: null,
                login: login,
                logout: logout,
                isAuth: isAuth
            };

        return exports;

        ////////////

        function logout() {
            exports.userInfo = null;
            chrome.storage.local.remove('userInfo');
            $http.defaults.headers.common['Authentication'] = undefined;
            chrome.runtime.sendMessage({
                type: _gConst.MSG_TYPE_USER_LOGGED_OUT
            });
            $location.path('/auth');
        }

        function login(params) {
            return $http
                .post(_gApiURL + "login", params)
                .then((resp) => {
                    if (resp.data.data) {
                        exports.userInfo = resp.data.data;
                        $http.defaults.headers.common['Authentication'] = resp.data.data.Token;
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
            if (exports.userInfo !== null) {
                dfd.resolve(undefined);
            } else {
                chrome.storage.local.get('userInfo', (data) => {
                    let resolve = '/auth';
                    if (data.userInfo) {
                        exports.userInfo = data.userInfo;
                        resolve = undefined;
                    }
                    dfd.resolve(resolve);
                });
            }
            return dfd.promise;
        }
    }

})(window.angular);
