/**
 * @ngdoc service
 * @name refigure.collections.services:collections
 * @description
 * profile service
 */
(function (angular) {
    'use strict';

    var _apiUrl = '/api';
    var _itemDescriptionLength = 55;

    angular
        .module('refigure.collections', [])
        .factory('collections', serviceFunc);

    serviceFunc.$inject = ['$http', 'auth'];

    function serviceFunc($http, auth) {
        //noinspection UnnecessaryLocalVariableJS
        var exports = {
            mostVisited: mostVisited,
            search: search,
            myCollections: myCollections,
            remove: remove,
            get: get,
            save: save,
            toggleFlag: toggleFlag,
            statistics: statistics
        };

        return exports;

        ////////////////

        /**
         * @ngdocs method
         * @name refigure.collections.services:collections#mostVisited
         * @methodOf refigure.collections.services:collections
         * @param {Object=} opts Search query options
         * @returns {Object} promise
         * @description
         * Loads most visited collection
         */
        function mostVisited(opts) {
            return $http
                .get(_apiUrl + '/most-visited-metapublications', {
                    params: {
                        limit: opts.limit
                    }
                })
                .then(function (res) {
                    var items = utils.get(res, 'data.data');
                    return itemsUIData(items);
                });
        }

        /**
         * @ngdocs method
         * @name refigure.collections.services:collections#get
         * @methodOf refigure.collections.services:collections
         * @param {String} ID Metapublication ID
         * @returns {Promise} promise
         * @description
         * Gets collection
         */
        function get(ID) {
            return $http
                .get(_apiUrl + '/metapublication/' + ID)
                .then(function (res) {
                    var items = utils.get(res, 'data.data');
                    return itemUIData(items);
                });
        }

        /**
         * @ngdocs method
         * @name refigure.collections.services:collections#save
         * @methodOf refigure.collections.services:collections
         * @param {Object} collection Refigure
         * @returns {Promise} promise
         * @description
         * Saves collection
         */
        function save(collection) {
            return $http
                .put(_apiUrl + '/metapublication/', collection)
                .then(function (res) {
                    var items = utils.get(res, 'data.data');
                    return itemUIData(items);
                });
        }

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
                .get(_apiUrl + '/metapublications', {
                    params: opts
                })
                .then(function (res) {
                    var items = utils.get(res, 'data.data');
                    items.results = itemsUIData(items.results);
                    return items;
                });
        }

        /**
         * @ngdocs method
         * @name refigure.collections.services:collection#remove
         * @methodOf refigure.collections.services:collections
         * @param {String} id id of element to delete
         * @returns {Object} promise
         * @description
         * Removes collection
         */
        function remove(id) {
            return $http.delete(_apiUrl + '/metapublication/' + id);
        }

        /**
         * @ngdocs method
         * @name refigure.collections.services:collection#myCollections
         * @methodOf refigure.collections.services:collections
         * @param {Object=} opts Search query options
         * @returns {Object} promise
         * @description
         * Searches collection
         */
        function myCollections(opts) {
            return $http
                .get(_apiUrl + '/my-metapublications', {
                    params: opts
                })
                .then(function (res) {
                    var items = utils.get(res, 'data.data');
                    items.results = itemsUIData(items.results);
                    console.log(items);
                    return items;
                });
        }

        /**
         * @ngdocs method
         * @name refigure.collections.services:collection#toggleFlag
         * @methodOf refigure.collections.services:collections
         * @param {String} ID Metapublication ID
         * @returns {Object} promise
         * @description
         * Switches Flagged state
         */
        function toggleFlag(ID) {
            return $http
                .put(_apiUrl + '/metapublication-flag', {
                    ID: ID
                });
        }

        /**
         * @ngdocs method
         * @name refigure.collections.services:collection#statistics
         * @methodOf refigure.collections.services:collections
         * @returns {Object} promise
         * @description
         * Refigure statistics for dashboard
         */
        function statistics() {
            return $http
                .get(_apiUrl + '/statistics')
                .then(function (resp) {
                    return utils.get(resp, 'data.data');
                });
        }

        /**
         * @ngdocs method
         * @name refigure.collections.services:collection#itemsUIData
         * @methodOf refigure.collections.services:collections
         * @param {Array=} items Search query options
         * @returns {Object} promise
         * @description
         * Re-map data for UI
         */
        function itemsUIData(items) {
            return items.map(function (_item) {
                return itemUIData(_item);
            });
        }

        /**
         * @ngdocs method
         * @name refigure.collections.services:collection#itemUIData
         * @methodOf refigure.collections.services:collections
         * @param {Object=} item Search query options
         * @returns {Object} promise
         * @description
         * Re-map data for UI
         */
        function itemUIData(item) {
            item = item.Metapublication;
            item.$ui = {};

            var uiData = item.$ui;

            uiData.title = item.Title;
            uiData.description = (item.Description || '').substring(0, _itemDescriptionLength);
            if (item.Description && uiData.description !== item.Description) {
                uiData.description += '...';
            }

            auth.setUsrNames(item.User);

            if (!item.FiguresCount) {
                item.FiguresCount = item.Figures.length;
            }

            uiData.img = {};
            // $ui.img.src
            if (!utils.empty(item.Figures)) {
                var first = item.Figures[0];
                uiData.img.src = first.URL;
            } else {
                uiData.img.src = 'img/no-image.png';
            }
            return item;
        }
    }
})(window.angular);
