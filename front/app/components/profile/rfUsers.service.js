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
            remove: remove
        };

        return exports;

        ////////////////

        /**
         * @ngdocs method
         * @name refigureProfile.services:rfUsers#search
         * @methodOf refigureProfile.services:rfUserss
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
         * @methodOf refigureProfile.services:rfUserss
         * @param {String} id id of element to delete
         * @returns {Object} promise
         * @description
         * Removes user
         */
        function remove(id) {
            return $http.delete(profileApiUri + '/user/' + id);
        }

    }
})(window.angular);
