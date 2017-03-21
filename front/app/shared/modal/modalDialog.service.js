/**
 * @ngdoc service
 * @name refigureShared.services:modalDialog
 * @description
 * Modal dialog service
 */
(function (angular) {
    'use strict';

    angular
        .module('refigureShared')
        .factory('modalDialog', modalDialog);

    modalDialog.$inject = [
        '$mdDialog'
    ];

    function modalDialog($mdDialog) {
        var exports = {
            info: info,
            success: success,
            error: error,
            confirm: confirm,
            show: show
        };

        return exports;

        function info(message) {
            var dialog = $mdDialog.alert({
                title: 'ReFigure',
                textContent: message,
                ok: 'Close'
            });
            return show(dialog);
        }

        function success(message) {
            var dialog = $mdDialog.alert({
                title: 'ReFigure',
                textContent: message,
                ok: 'Close'
            });
            return show(dialog);
        }

        function error(message) {
            var dialog = $mdDialog.alert({
                title: 'ReFigure',
                textContent: message,
                ok: 'Close'
            });
            return show(dialog);
        }

        function confirm(message) {
            var dialog = $mdDialog.confirm({
                title: 'ReFigure',
                textContent: message
            })
                .ok('OK')
                .cancel('Cancel');
            return show(dialog);
        }

        function show(opts) {
            return $mdDialog.show(opts);
        }
    }
})(window.angular);
