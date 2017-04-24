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
        'profileApiUri'
    ];

    function RfUsers($http, profileApiUri) {
        //noinspection UnnecessaryLocalVariableJS
        var exports = {
            search: search
        };

        return exports;

        ////////////////

        /**
         * @ngdocs method
         * @name refigure.collections.services:collection#search
         * @methodOf refigure.collections.services:collections
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
                    return utils.get(res, 'data.data');
                });
        }

    }
})(window.angular);
