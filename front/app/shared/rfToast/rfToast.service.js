/**
 * @ngdoc service
 * @name refigureShared.services:rfToast
 * @description
 * Little message in the top-right of the page
 */
(function (angular) {
    'use strict';

    angular
        .module('refigureShared')
        .factory('rfToast', Service);

    Service.$inject = ['$mdToast'];

    function Service($mdToast) {
        //noinspection UnnecessaryLocalVariableJS
        var exports = {
            show: show
        };

        return exports;

        /////////////////////////////////////

        /**
         * @ngdoc method
         * @name refigureShared.services:rfToast#show
         * @methodOf refigureShared.services:rfToast
         * @param {Object} params cfg object
         * @param {String=} params.text text to show
         * @param {Number=} params.delay hide timeout
         * @param {String=} params.position position of toast
         * @description
         * Shows material toast
         */
        function show(params) {
            if (typeof params === 'string') {
                params = {
                    text: params
                };
            }
            params = angular.extend({
                text: 'The text is out there',
                delay: 2000,
                position: 'top right'
            }, params);
            $mdToast.show(
                $mdToast.simple()
                    .textContent(params.text)
                    .position(params.position)
                    .hideDelay(params.delay)
            );
        }
    }
})(window.angular);
