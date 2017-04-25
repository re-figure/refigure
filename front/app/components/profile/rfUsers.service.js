/**
 * @ngdoc service
 * @name refigureProfile.services:rfUsers
 * @description
 * users service
 */
(function (angular) {
    'use strict';

    angular
        .module('refigureProfile')
        .factory('rfUsers', RfUsers);

    RfUsers.$inject = [
        '$http',
        'profileApiUri',
        'auth'
    ];

    function RfUsers($http, profileApiUri, auth) {
        //noinspection UnnecessaryLocalVariableJS
        var exports = {
            search: search,
            remove: remove,
            get: get,
            save: save
        };

        return exports;

        ////////////////

        /**
         * @ngdocs method
         * @name refigureProfile.services:rfUsers#search
         * @methodOf refigureProfile.services:rfUsers
         * @param {Object=} opts Search query options
         * @returns {Object} promise
         * @description
         * Searches collection
         */
        function search(opts) {
            return $http
                .get(profileApiUri + '/users', {
                    params: opts
                })
                .then(function (res) {
                    var data = utils.get(res, 'data.data');
                    data.results = data.results.map(function (usr) {
                        auth.setUsrNames(usr.User);
                        return usr.User;
                    });
                    return data;
                });
        }

        /**
         * @ngdocs method
         * @name refigureProfile.services:rfUsers#remove
         * @methodOf refigureProfile.services:rfUsers
         * @param {String} id id of element to delete
         * @returns {Object} promise
         * @description
         * Removes user
         */
        function remove(id) {
            return $http.delete(profileApiUri + '/user/' + id);
        }

        /**
         * @ngdocs method
         * @name refigureProfile.services:rfUsers#get
         * @methodOf refigureProfile.services:rfUsers
         * @param {String} id id of element to load
         * @returns {Object} promise
         * @description
         * Gets user info
         */
        function get(id) {
            return $http.get(profileApiUri + '/user/' + id)
                .then(function (res) {
                    var user = utils.get(res, 'data.data.User');
                    auth.setUsrNames(user);
                    return user;
                });
        }

        /**
         * @ngdocs method
         * @name refigureProfile.services:rfUsers#save
         * @methodOf refigureProfile.services:rfUsers
         * @param {Object} user user obj to save
         * @returns {Promise} promise
         * @description
         * Saves user
         */
        function save(user) {
            return $http
                .put(profileApiUri + '/user/', user)
                .then(function (res) {
                    var user = utils.get(res, 'data.data.User');
                    auth.setUsrNames(user);
                    return user;
                });
        }

    }
})(window.angular);
