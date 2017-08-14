/**
 * @ngdoc service
 * @name refigure.chrome.services
 * @description
 * Chrome methods wrapper
 */
(function (angular) {
    'use strict';

    angular
        .module('refigureShared')
        .factory('chromeService', serviceFunc);

    serviceFunc.$inject = ['CONST'];

    function serviceFunc(CONST) {
        //noinspection UnnecessaryLocalVariableJS
        var exports = {
            sendMessage: sendMessage
        };

        return exports;

        ////////////////

        /**
         * @ngdocs method
         * @name refigure.chrome.services#sendMessage
         * @methodOf refigure.chrome.services
         * @param {Object} message
         * @param {Function} callback
         * @description
         * Sends chrome message
         */
        function sendMessage(message, callback) {
            if (chrome) {
                chrome.runtime.sendMessage(CONST.extensionId, message, callback);
            }
        }
    }
})(window.angular);
