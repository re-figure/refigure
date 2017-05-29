/**
 * @ngdoc service
 * @name refigure.news.services:news
 * @description
 * News service
 */
(function (angular) {
    'use strict';

    var _apiUrl = '/api';

    angular
        .module('refigure.news', [])
        .factory('news', serviceFunc);

    serviceFunc.$inject = ['$http'];

    function serviceFunc($http) {
        //noinspection UnnecessaryLocalVariableJS
        var exports = {
            getAll: getAll,
            getSingle: getSingle
        };

        return exports;

        ////////////////

        /**
         * @ngdocs method
         * @name refigure.news.services:news#getAll
         * @methodOf refigure.news.services:news
         * @returns {Object} promise
         * @description
         * Loads most all news
         */
        function getAll() {
            return $http
                .get(_apiUrl + '/news')
                .then(function (res) {
                    return utils.get(res, 'data.data');
                });
        }

        /**
         * @ngdocs method
         * @name refigure.news.services:news#getSingle
         * @methodOf refigure.news.services:news
         * @param {String} id news id
         * @returns {Object} promise
         * @description
         * Loads most all news
         */
        function getSingle(id) {
            return $http
                .get(_apiUrl + '/news/' + id)
                .then(function (res) {
                    return utils.get(res, 'data.data.News');
                });
        }
    }
})(window.angular);
