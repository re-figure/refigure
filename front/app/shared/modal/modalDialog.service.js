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
        //noinspection UnnecessaryLocalVariableJS
        var exports = {
            info: info,
            success: success,
            error: error,
            confirm: confirm,
            show: show,
            cancel: cancel,
            ok: ok
        };

        return exports;

        function info(message) {
            var dialog = $mdDialog.alert({
                title: 'Refigure',
                textContent: message,
                ok: 'Close'
            });
            return show(dialog);
        }

        function success(message) {
            var dialog = $mdDialog.alert({
                title: 'Refigure',
                textContent: message,
                ok: 'Close'
            });
            return show(dialog);
        }

        function error(message) {
            var dialog = $mdDialog.alert({
                title: 'Refigure',
                textContent: message,
                ok: 'Close'
            });
            return show(dialog);
        }

        function confirm(message) {
            var dialog = $mdDialog.confirm({
                title: 'Refigure',
                textContent: message
            })
                .ok('OK')
                .cancel('Cancel');
            return show(dialog);
        }

        function show(opts) {
            return $mdDialog.show(opts);
        }

        function ok() {
            $mdDialog.hide();
        }

        function cancel() {
            $mdDialog.cancel();
        }
    }
})(window.angular);
