/**DateCreated
 * Authentication Service
 */
(function (angular) {
    'use strict';

    angular
        .module('refigureAuth')
        .value('authUserInfo', {
            Email: '',
            FullName: '',
            Initials: '',
            RegistrationType: 0,
            Type: 0
        })
        .factory('authToken', authToken)
        .factory('auth', auth)
        .factory('authInterceptor', authInterceptor)
        .factory('authErrorInterceptor', authErrorInterceptor);

    //noinspection UnnecessaryLocalVariableJS
    var AUTH_TOKEN = 'Authentication';
    var AUTH_HEADER = AUTH_TOKEN;

    /**
     * @ngdoc service
     * @name refigureAuth.services:authToken
     * @description
     * Authentication token manager
     */
    authToken.$inject = [
        '$location',
        '$cookies'
    ];

    function authToken($location, $cookies) {
        var exports = {
            isAuthenticated: isAuthenticated,
            getToken: getToken,
            setToken: setToken,
            removeToken: removeToken
        };

        var _domainCookie = _domain();

        return exports;

        /**
         * @ngdoc method
         * @name refigureAuth.services:authToken#isAuthenticated
         * @methodOf refigureAuth.services:authToken
         * @returns {Boolean} true if authenticated
         * @description
         * Check whether user is authenticated ot not
         */
        function isAuthenticated() {
            return !!getToken();
        }

        /**
         * @ngdoc method
         * @name refigureAuth.services:authToken#getToken
         * @methodOf refigureAuth.services:authToken
         * @returns {String} User authentication token
         * @description
         * Returns user authentication token
         */
        function getToken() {
            return $cookies.get(AUTH_TOKEN);
        }

        /**
         * @ngdoc method
         * @name refigureAuth.services:authToken#setToken
         * @methodOf refigureAuth.services:authToken
         * @param {String} token The token to store
         * @description
         * Sets user authentication token
         */
        function setToken(token) {
            $cookies.put(AUTH_TOKEN, token, {
                domain: _domainCookie
            });
        }

        /**
         * @ngdoc method
         * @name refigureAuth.services:authToken#removeToken
         * @methodOf refigureAuth.services:authToken
         * @description
         * Removes user authentication token
         */
        function removeToken() {
            $cookies.remove(AUTH_TOKEN, {
                domain: _domainCookie
            });
        }

        /**
         * @ngdoc method
         * @name refigureAuth.services:authToken#_domain
         * @methodOf refigureAuth.services:authToken
         * @description
         * Figures out domain setting for cookies
         */
        function _domain() {
            var host = $location.host();
            if (host === 'localhost' || host === '127.0.0.1') {
                return host;
            }
            // return only 'root' domain
            // assumption here: we use domains like example.com
            // not like example.co.uk
            //fixme: chrome.cookie.set (from extension/popup) can only set cookie to url, not domain name
            //fixme: so we cant set cookie to [.noblecoz.com]. Only Valid urls [refigure.noblecoz.com]
            //return '.' + host.split('.').slice(-2).join('.');
            return host;
        }
    }

    /**
     * @ngdoc service
     * @name refigureAuth.services:auth
     * @description
     * Authentication manager
     */
    auth.$inject = [
        '$http',
        '$state',
        '$q',
        'authApiUri',
        'authToken',
        'authUserInfo'
    ];

    function auth($http, $state, $q, authApiUri, authToken, authUserInfo) {
        var _userPromise;

        var exports = {
            register: register,
            validateRegistration: validateRegistration,
            login: login,
            usrInfo: usrInfo,
            fillUsrInfo: fillUsrInfo,
            setUsrNames: setUsrNames,
            logout: logout,
            remindPassword: remindPassword,
            checkResetToken: checkResetToken,
            resetPassword: resetPassword,
            isAuthUrl: isAuthUrl,
            isPrivateUrl: isPrivateUrl,
            saveAndSign: saveAndSign,
            saveCurrentUrl: saveCurrentUrl,
            loadCurrentUrl: loadCurrentUrl,
            isAuthenticated: authToken.isAuthenticated,
            oAuth: {
                google: oAuthGoogle,
                fb: oAuthFB
            }
        };

        var savedUrl = {
            state: 'profile',
            params: null
        };

        return exports;

        function oAuthGoogle(token) {
            return $http
                .get(authApiUri + '/oauth/google/' + token)
                .then(function (res) {
                    var user = utils.get(res, 'data.data');
                    authToken.setToken(user.Token);
                    fillUsrInfo(user);
                    loadCurrentUrl();
                });
        }

        function oAuthFB(token) {
            return $http
                .get(authApiUri + '/oauth/fb/' + token)
                .then(function (res) {
                    var user = utils.get(res, 'data.data');
                    authToken.setToken(user.Token);
                    fillUsrInfo(user);
                    loadCurrentUrl();
                });
        }

        /**
         * @ngdoc method
         * @name refigureAuth.services:auth#register
         * @methodOf refigureAuth.services:auth
         * @param   {Object}        user                User Info
         * @param   {String}        user.FirstName      First name
         * @param   {String}        user.LastName       Last name
         * @param   {String}        user.Organization   Organization
         * @param   {String}        user.Phone          Phone
         * @param   {String}        user.Password       Password
         * @param   {String}        user.captcha        Security code
         * @param   {Boolean}       user.agreed         Agree with terms of Service
         * @returns {Object} promise
         * @description
         * It registers user
         */
        function register(user) {
            return $http
                .post(authApiUri + '/register/', user)
                .then(function (res) {
                    return utils.get(res.data, 'data');
                });
        }

        /**
         * @ngdoc method
         * @name refigureAuth.services:auth#validateRegistration
         * @methodOf refigureAuth.services:auth
         * @param   {String}        token Token to validate
         * @returns {Object} promise
         * @description
         * It validates user registration by sending confirmation token
         */
        function validateRegistration(token) {
            return $http
                .post(authApiUri + '/registration-complete/', {
                    token: token
                })
                .then(function (res) {
                    var data = utils.get(res.data, 'data');
                    authToken.setToken(data.Token);
                    fillUsrInfo(data);
                    return data;
                });
        }

        /**
         * @ngdoc method
         * @name refigureAuth.services:auth#login
         * @methodOf refigureAuth.services:auth
         * @param   {Object}        credentials             User credentials
         * @param   {String}        credentials.username    User name
         * @param   {String}        credentials.password    Password
         * @returns {Object} promise
         * @description
         * It sends login command to the server
         */
        function login(credentials) {
            return $http
                .post(authApiUri + '/login/', credentials, {}) // noIntercept: true
                .then(function (res) {
                    var data = utils.get(res.data, 'data');
                    authToken.setToken(data.Token);
                    fillUsrInfo(data);
                    return data;
                });
        }

        /**
         * @ngdoc method
         * @name refigureAuth.services:auth#usrInfo
         * @methodOf refigureAuth.services:auth
         * @returns {Object} promise
         * @description
         * Loads user info from session
         */
        function usrInfo() {
            if (!_userPromise) {
                _userPromise = $http
                    .get(authApiUri + '/userinfo/')
                    .then(function (res) {
                        var data = utils.get(res, 'data.data');
                        fillUsrInfo(data);
                        return data;
                    });
            }
            return _userPromise;
        }

        /**
         * @ngdoc method
         * @name refigureAuth.services:auth#logout
         * @methodOf refigureAuth.services:auth
         * @description
         * It sends request to backend and logout client
         */
        function logout() {
            var deferred = $q.defer();
            saveCurrentUrl();
            authToken.removeToken();
            _userPromise = null;
            fillUsrInfo();
            deferred.resolve();
            return deferred.promise;
        }

        /**
         * @ngdoc method
         * @name refigureAuth.services:auth#remindPassword
         * @methodOf refigureAuth.services:auth
         * @param {Object} data                 User Information
         * @param {String} data.Email           User email
         * @param {String} data.captchaAnswer   Captcha
         * @description
         * It sends "remind password" command to the server
         */
        function remindPassword(data) {
            return $http
                .post(authApiUri + '/password-change-request/', data, {})
                //noIntercept: true
                .then(function (res) {
                    return utils.get(res, 'data');
                });
        }

        /**
         * @ngdoc method
         * @name refigureAuth.services:auth#checkResetToken
         * @methodOf refigureAuth.services:auth
         * @param {Object}  data            User Information
         * @param {String}  data.token      Reset password token
         * @description
         * It checks whether reset password token is valid
         */
        function checkResetToken(data) {
            return $http
                .get(authApiUri + '/password-change/' + data.token)
                .then(function (res) {
                    return utils.get(res, 'data');
                });
        }

        /**
         * @ngdoc method
         * @name refigureAuth.services:auth#resetPassword
         * @methodOf refigureAuth.services:auth
         * @param {Object}  data            User Information
         * @param {String}  data.token      Reset password token
         * @param {String}  data.password   New password
         * @description
         * It sends reset password command on server
         */
        function resetPassword(data) {
            return $http
                .post(authApiUri + '/password-change/', {
                    token: data.token,
                    Password: data.Password
                })
                .then(function (res) {
                    return utils.get(res, 'data');
                });
        }

        /**
         * @ngdoc method
         * @name refigureAuth.services:auth#saveAndSign
         * @methodOf refigureAuth.services:auth
         * @description
         * Saves current url.
         * Then, goes to sign in page
         */
        function saveAndSign(state, params) {
            saveCurrentUrl(state, params);
            $state.go('auth.signin', {}, {
                // location: 'replace'
            });
        }

        /**
         * @ngdoc method
         * @name refigureAuth.services:auth#saveCurrentUrl
         * @methodOf refigureAuth.services:auth
         * @description
         * Saves current url.
         * The url will be used for navigation on login.success event.
         */
        function saveCurrentUrl(state, params) {
            if (!state) {
                state = $state.current;
            }
            if (!isAuthUrl(state)) {
                savedUrl = {
                    state: state.name,
                    params: params
                };
            }
        }

        /**
         * @ngdoc method
         * @name refigureAuth.services:auth#loadCurrentUrl
         * @methodOf refigureAuth.services:auth
         * @description
         * It loads last used url saved by saveCurrentUrl
         */
        function loadCurrentUrl() {
            $state.go(savedUrl.state, savedUrl.params, {
                location: 'replace'
            });
        }

        /**
         * @ngdoc method
         * @name refigureAuth.services:auth#isAuthUrl
         * @methodOf refigureAuth.services:auth
         * @param {Object} state Ui router state
         * @returns {Boolean} True if we are on authentication page
         * @description
         * Checks whether the current url is authentication. (register, login, etc.)
         */
        function isAuthUrl(state) {
            if (!state) {
                state = $state.current;
            }
            return !!utils.get(state, 'data.auth', false);
        }

        /**
         * @ngdoc method
         * @name refigureAuth.services:auth#isPrivateUrl
         * @methodOf refigureAuth.services:auth
         * @param {Object} state Ui router state
         * @returns {Boolean} True if we are on private page
         * @description
         * Checks whether the current url is url to private page. (profile, my account, etc.)
         */
        function isPrivateUrl(state) {
            if (!state) {
                state = $state.current;
            }
            return !!utils.get(state, 'data.private', false);
        }

        /**
         * @ngdoc method
         * @name refigureAuth.services:auth#fillUsrInfo
         * @methodOf refigureAuth.services:auth
         * @param {Object=} info User info
         * @description
         * Fills current user info
         */
        function fillUsrInfo(info) {
            if (!angular.isDefined(info)) {
                authUserInfo.Email = '';
                authUserInfo.FullName = '';
                authUserInfo.Initials = '';
                authUserInfo.RegistrationType = 0;
                authUserInfo.Type = 0;
            } else {
                if (angular.isDefined(info.Email)) {
                    authUserInfo.Email = info.Email;
                }
                if (angular.isDefined(info.RegistrationType)) {
                    authUserInfo.RegistrationType = info.RegistrationType;
                }
                if (angular.isDefined(info.Type)) {
                    authUserInfo.Type = info.Type;
                }
                authUserInfo.FirstName = info.FirstName;
                authUserInfo.LastName = info.LastName;
                setUsrNames(authUserInfo);
            }
        }
    }

    /**
     * @ngdoc method
     * @name refigureAuth.services:auth#setUsrNames
     * @methodOf refigureAuth.services:auth
     * @param {Object} obj userInfo object
     * @param {String} obj.FirstName user first name
     * @param {String} obj.LastName user last name
     * @param {String} obj.FullName joined full name
     * @param {String} obj.Initials user initials
     * @description
     * Sets Initials and Full name from current First and Last names
     */
    function setUsrNames(obj) {
        if (angular.isDefined(obj.FirstName) || angular.isDefined(obj.LastName)) {
            var names = [], initials = [];
            if (obj.FirstName) {
                obj.FirstName = firstToUpper(obj.FirstName);
                names.push(obj.FirstName);
                initials.push(obj.FirstName.charAt(0) + '.');
            }
            if (obj.LastName) {
                obj.LastName = firstToUpper(obj.LastName);
                names.push(obj.LastName);
                initials.push(obj.LastName.charAt(0) + '.');
            }
            obj.Initials = initials.join(' ');
            obj.FullName = names.join(' ');
        }
        function firstToUpper(str) {
            return str.charAt(0).toUpperCase() + str.slice(1);
        }
    }

    /**
     * @ngdoc service
     * @name refigureAuth.services:authInterceptor
     * @description
     * Authentication interceptor
     */
    authInterceptor.$inject = [
        'authToken'
    ];

    function authInterceptor(authToken) {
        //noinspection UnnecessaryLocalVariableJS
        var exports = {
            request: request,
            response: response
        };

        return exports;

        /**
         * Request
         */
        function request(config) {
            var token = authToken.getToken();
            if (token) {
                config.headers[AUTH_HEADER] = token;
            }
            return config;
        }

        /**
         * Response
         */
        function response(resp) {
            var token = utils.get(resp, ['config', 'headers', AUTH_HEADER]);
            if (token) {
                authToken.setToken(token);
            }
            return resp;
        }
    }

    /**
     * @ngdoc service
     * @name refigureAuth.services:authErrorInterceptor
     * @description
     * HttpProvider Error interceptor
     */
    authErrorInterceptor.$inject = ['$q', '$injector'];

    function authErrorInterceptor($q, $injector) {
        //noinspection UnnecessaryLocalVariableJS
        var exports = {
            requestError: requestError,
            responseError: responseError
        };

        return exports;

        /**
         * RequestError
         */
        function requestError(rejection) {
            return $q.reject(rejection);
        }

        /**
         * ResponseError
         */
        function responseError(resp) {
            if (resp.status === 401) {
                // need to get dynamically to prevent "Circular Dependency" error
                var auth = $injector.get('auth');
                var $state = $injector.get('$state');
                auth.saveCurrentUrl();
                if (!auth.isAuthUrl($state.current)) {
                    $state.go('auth.signin');
                }
            }
            return $q.reject(resp);
        }
    }
})(window.angular);
