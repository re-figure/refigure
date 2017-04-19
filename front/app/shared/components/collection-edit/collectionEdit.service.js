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

    Service.$inject = ['$mdSidenav', 'collections', 'rfToast', 'rfImages'];

    function Service($mdSidenav, collections, rfToast, rfImages) {
        var _editing = null;
        var exports = {
            open: open,
            close: close,
            removeImage: removeImage,
            saveImage: saveImage,
            collection: {},
            saveCollection: saveCollection,
            reset: reset
        };

        return exports;

        /////////////////////////////////////

        /**
         * @ngdoc method
         * @name refigureShared.services:collectionEditService#saveCollection
         * @methodOf refigureShared.services:collectionEditService
         * @description
         * Saves collection
         */
        function saveCollection() {
            return collections
                .save(exports.collection)
                .then(function (refigure) {
                    angular.extend(_editing, refigure);
                    exports.close();
                    rfToast.show('Refigure saved successfully');
                });
        }

        /**
         * @ngdoc method
         * @name refigureShared.services:collectionEditService#open
         * @methodOf refigureShared.services:collectionEditService
         * @param {Object} collection Metapublication to edit
         * @description
         * Opens sidenav panel
         */
        function open(collection) {
            _editing = collection;
            return collections
                .get(collection.ID)
                .then(function (resp) {
                    exports.collection = resp;
                    $mdSidenav('collectionDetails').open();
                    return resp;
                });
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
            reset();
        }

        /**
         * @ngdoc method
         * @name refigureShared.services:collectionEditService#removeImage
         * @methodOf refigureShared.services:collectionEditService
         * @description
         * Removes image
         */
        function removeImage(index) {
            exports.collection.Figures[index]._loading = true;
            return rfImages
                .remove(exports.collection.Figures[index].ID)
                .then(function () {
                    exports.collection.Figures.splice(index, 1);
                    _editing.FiguresCount--;
                    rfToast.show('Image removed');
                }, function () {
                    exports.collection.Figures[index]._loading = false;
                });
        }

        /**
         * @ngdoc method
         * @name refigureShared.services:collectionEditService#saveImage
         * @methodOf refigureShared.services:collectionEditService
         * @param {Number} index index of Image to save
         * @description
         * Edits image
         */
        function saveImage(index) {
            exports.collection.Figures[index]._loading = true;
            return rfImages
                .save(exports.collection.Figures[index])
                .finally(function () {
                    exports.collection.Figures[index]._loading = false;
                });
        }

        /**
         * @ngdoc method
         * @name refigureShared.services:collectionEditService#reset
         * @methodOf refigureShared.services:collectionEditService
         * @description
         * Resets local data to default state
         */
        function reset() {
            exports.collection.ID = null;
            _editing = null;
        }
    }
})(window.angular);
