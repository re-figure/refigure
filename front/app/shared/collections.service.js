/**
 * @ngdoc service
 * @name refigure.collections.services:collections
 * @description
 * profile service
 */
(function (angular) {
    'use strict';

    var _apiUrl = '/api';
    var _itemDescriptionLength = 60;

    angular
        .module('refigure.collections', [])
        .factory('collections', serviceFunc);

    serviceFunc.$inject = [
        '$http',
        '$log'
    ];

    function serviceFunc($http, $log) {
        var exports = {
            mostVisited: mostVisited,
            search: search,
            myCollections: myCollections
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
                    return itemsUIData(items);
                });
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
                    var items = utils.get(res, 'data.data.results');
                    console.log(items);
                    return itemsUIData(items);
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

            uiData.title = (item.Description || '').substring(0, _itemDescriptionLength);
            if (uiData.title !== item.Description) {
                uiData.title += '...';
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
