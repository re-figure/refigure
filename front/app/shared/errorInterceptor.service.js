/**
 * @ngdoc service
 * @name refigureShared.services:errorInterceptor
 * @description
 * HttpProvider Error interceptor
 */
(function (angular) {
    'use strict';

    angular
        .module('refigureShared')
        .factory('errorInterceptor', errorInterceptor);

    errorInterceptor.$inject = [
        '$q',
        '$log',
        '$injector'
    ];

    function errorInterceptor($q, $log, $injector) {
        var exports = {
            response: response,
            responseError: responseError
        };

        return exports;

        ////////////////////////////

        function _error(res, defErr) {
            var error = utils.get(res, ['data', 'error'], defErr),
                message = utils.get(res, ['data', 'message'], 'Network error occurred.');
            if (error) {
                utils.set(res, ['data', 'error'], error);
                utils.set(res, ['data', 'message'], message);
            }
            return {
                error: error,
                message: message
            };
        }

        function response(res) {
            var error = _error(res, 0);
            if (error.error) {
                if (intercept(res, error)) {
                    showError(error);
                }
                return $q.reject(res);
            }
            return res;
        }

        function responseError(res) {
            var error = _error(res, -1);
            if (intercept(res, error)) {
                showError(error);
            }
            return $q.reject(res);
        }

        function intercept(res, error) {
            var url = utils.get(res, ['config', 'url']),
                noIntercept = utils.get(res, ['config', 'noIntercept']);
            if (noIntercept) {
                return false;
            }
            return !validError(error);
        }

        function validError(error) {
            return false;
        }

        function showError(error) {
            var modalDialog = $injector.get('modalDialog');
            return modalDialog.error(error.message);
        }
    }
})(window.angular);
