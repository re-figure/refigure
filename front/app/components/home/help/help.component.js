/**
 * @ngdoc directive
 * @name refigureApp.directive:help
 * @restrict E
 * @description
 * Help Page
 * @example
 * <help></help>
 */
(function(angular) {
    'use strict';

    angular
        .module('refigureApp')
        .component('help', {
            templateUrl: 'view/help.component.html',
            controller: Controller,
            controllerAs: 'vm'
        });

    Controller.$inject = ['$location', 'modalDialog'];

    function Controller($location, modalDialog) {
        var vm = this;
        var _actions = {
            feedback: function () {
                modalDialog.info(
                    'If you are experiencing any problems with this extension or have questions or suggestions, ' +
                    'please email <a href="mailto:refigure@refigure.org">refigure@refigure.org</a>',
                    true
                );
            }
        };

        vm.$onInit = activate;

        /////////////////////

        /**
         * @ngdoc method
         * @name refigureApp.directive:help#activate
         * @methodOf refigureApp.directive:help
         * @description
         * Activates controller
         */
        function activate() {
            var hash = $location.hash();
            if (hash.trim() !== '') {
                var command = hash.split('=');
                if (command[0] === 'action' && typeof _actions[command[1]] === 'function') {
                    _actions[command[1]].call();
                }
            }
        }
    }
})(window.angular);
