/**
 * @ngdoc service
 * @name refigureProfile.services:profile
 * @description
 * profile service
 */
(function (angular) {
    'use strict';

    angular
        .module('refigureProfile')
        .factory('profile', profile);

    profile.$inject = [
        '$http',
        'profileApiUri',
        'auth'
    ];

    function profile($http, profileApiUri, auth) {
        var exports = {
            getAccount: getAccount,
            updateAccount: updateAccount,
            updatePassword: updatePassword
        };

        return exports;

        ////////////////

        /**
         * @ngdocs method
         * @name refigureProfile.services:profile#getAccount
         * @methodOf refigureProfile.services:profile
         * @returns {Object} promise
         * @description
         * Loads account info from session
         */
        function getAccount() {
            return auth.usrInfo();
        }

        /**
         * @ngdocs method
         * @name refigureProfile.services:profile#updateAccount
         * @methodOf refigureProfile.services:profile
         * @param {Object} data New account information
         * @returns {Object} promise
         * @description
         * Updates account information
         */
        function updateAccount(data) {
            return $http
                .post(profileApiUri + '/profile-update/', data)
                .then(function (res) {
                    var data = utils.get(res, 'data.data');
                    auth.fillUsrInfo(data);
                    return data;
                });
        }

        /**
         * @ngdocs method
         * @name refigureProfile.services:profile#updatePassword
         * @methodOf refigureProfile.services:profile
         * @param {String} password New password
         * @returns {Object} promise
         * @description
         * Updates user password
         */
        function updatePassword(password) {
            return $http
                .post(profileApiUri + '/password-change/', {
                    Password: password
                })
                .then(function (res) {
                    return utils.get(res, 'data.data');
                });
        }
    }
})(window.angular);
