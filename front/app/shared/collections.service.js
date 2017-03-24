/**
 * @ngdoc service
 * @name refigureShared.services:collections
 * @description
 * profile service
 */
(function (angular) {
    'use strict';

    angular
        .module('refigureShared')
        .factory('collections', serviceFunc);

    serviceFunc.$inject = [
        '$http',
        '$q'
    ];

    function serviceFunc($http, $q) {
        var exports = {
            mostVisited: mostVisited,
            search: search
        };

        return exports;

        ////////////////

        /**
         * @ngdocs method
         * @name refigureShared.services:collections#mostVisited
         * @methodOf refigureShared.services:collections
         * @param {Object=} opts Search query options
         * @returns {Object} promise
         * @description
         * Loads most visited collections
         */
        function mostVisited(opts) {
            return search(opts);
        }

        /**
         * @ngdocs method
         * @name refigureShared.services:collections#search
         * @methodOf refigureShared.services:collections
         * @param {Object=} opts Search query options
         * @returns {Object} promise
         * @description
         * Searches collections
         */
        function search(opts) {
            var deferred = $q.defer();
            deferred.resolve([{
                img: {
                    src: 'https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcS2cfSsO7u34-I3IZmo7xan9CILgbkl9JvEaZI8ysjsHpPvTHoW'
                },
                title: 'Lorem ipsum dolor sit amet, quo et case noster, mel equidem deserunt in.'
            }, {
                img: {
                    src: 'https://s-media-cache-ak0.pinimg.com/736x/82/2e/d9/822ed97e5704863d3c2a046e4e4e24af.jpg'
                },
                title: ' Wisi laboramus consectetuer id vis, ne eam timeam vidisse singulis, no vitae civibus ius.'
            }, {
                img: {
                    src: 'https://s-media-cache-ak0.pinimg.com/originals/de/67/94/de6794d68644aebb8c8659d7aaaed58a.jpg'
                },
                title: 'Vix ne solum quando adolescens, omnes invidunt duo ne. Et maiorum salutandi vel, et ipsum ocurreret definitionem vis.'
            }]);
            return deferred.promise;
        }
    }
})(window.angular);
