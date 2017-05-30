/**
 * @ngdoc service
 * @name refigure.blog.services:blog
 * @description
 * blog service
 */
(function (angular) {
    'use strict';

    var _apiUrl = '/api',
        _itemDescriptionLength = 400;

    angular
        .module('refigure.blog', [])
        .factory('blog', serviceFunc);

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
         * @name refigure.blog.services:blog#getAll
         * @methodOf refigure.blog.services:blog
         * @returns {Object} promise
         * @description
         * Loads most all blog
         */
        function getAll() {
            return $http
                .get(_apiUrl + '/blog')
                .then(function (res) {
                    var blog = utils.get(res, 'data.data') || [];
                    return blog.map(function (item) {
                        return adjustItem(item);
                    });
                });
        }

        /**
         * @ngdocs method
         * @name refigure.blog.services:blog#getSingle
         * @methodOf refigure.blog.services:blog
         * @param {String} id blog id
         * @returns {Object} promise
         * @description
         * Loads most all blog
         */
        function getSingle(id) {
            return $http
                .get(_apiUrl + '/blog/' + id)
                .then(function (res) {
                    var blogItem = utils.get(res, 'data.data') || {};
                    return adjustItem(blogItem);
                });
        }

        function adjustItem(item) {
            item = item.Blog;
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
