/**
 * @ngdoc service
 * @name refigureShared.services:collections
 * @description
 * profile service
 */
(function (angular) {
    'use strict';

    var _apiUrl = '/api';

    angular
        .module('refigureShared')
        .factory('rfImages', serviceFunc);

    serviceFunc.$inject = ['$http'];

    function serviceFunc($http) {
        //noinspection UnnecessaryLocalVariableJS
        var exports = {
            remove: remove,
            save: save
        };

        return exports;

        ////////////////

        /**
         * @ngdocs method
         * @name refigure.collections.services:collections#remove
         * @methodOf refigure.collections.services:collections
         * @param {String} ID Image ID to delete
         * @returns {Object} promise
         * @description
         * Remove image from collection
         */
        function remove(ID) {
            return $http
                .delete(_apiUrl + '/figure/' + ID);
        }

        /**
         * @ngdocs method
         * @name refigure.collections.services:collections#save
         * @methodOf refigure.collections.services:collections
         * @param {Object} image image to save
         * @returns {Object} promise
         * @description
         * Edits image
         */
        function save(image) {
            return $http
                .put(_apiUrl + '/figure', image);
        }

    }
})(window.angular);
