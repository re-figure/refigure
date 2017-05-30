/**
 * @ngdoc service
 * @name refigure.news.services:news
 * @description
 * News service
 */
(function (angular) {
    'use strict';

    var _apiUrl = '/api',
        _itemDescriptionLength = 400;

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
                    var news = utils.get(res, 'data.data') || [];
                    return news.map(function (item) {
                        return adjustItem(item);
                    });
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
                    var newsItem = utils.get(res, 'data.data') || {};
                    return adjustItem(newsItem);
                });
        }

        function adjustItem(item) {
            item = item.News;
            if (!item.Content) {
                item.briefContent = '';
            } else {
                var div = document.createElement('div');
                div.innerHTML = item.Content;
                var strippedContent = div.textContent || div.innerText || '';
                item.briefContent = strippedContent.substring(0, _itemDescriptionLength);
                if (item.briefContent !== strippedContent) {
                    item.briefContent += '...';
                }
            }
            return item;
        }
    }
})(window.angular);
