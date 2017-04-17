/**
 * @ngdoc service
 * @name refigureShared.services:collectionEditService
 * @description
 * profile service
 */
(function (angular) {
    'use strict';

    angular
        .module('refigureShared')
        .factory('collectionEditService', Service);

    Service.$inject = ['$mdSidenav', 'collections'];

    function Service($mdSidenav, collections) {
        var exports = {
            open: open,
            close: close,
            collection: {}
        };

        return exports;

        /////////////////////////////////////

        /**
         * @ngdoc method
         * @name refigureShared.services:collectionEditService#open
         * @methodOf refigureShared.services:collectionEditService
         * @param {String} collectionID Metapublication to edit
         * @description
         * Opens sidenav panel
         */
        function open(collectionID) {
            return collections
                .getCollection(collectionID)
                .then(function (resp) {
                    exports.collection = resp;
                    $mdSidenav('collectionDetails').open();
                    return resp;
                });
        }

        function getCollection() {
            return exports.collection;
        }

        /**
         * @ngdoc method
         * @name refigureShared.services:collectionEditService#close
         * @methodOf refigureShared.services:collectionEditService
         * @description
         * Closes sidenav panel
         */
        function close() {
            $mdSidenav('collectionDetails').close();
        }
    }
})(window.angular);
