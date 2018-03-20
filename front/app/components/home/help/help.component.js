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

    Controller.$inject = ['$location', 'modalDialog', '$http'];

    function Controller($location, modalDialog, $http) {
        var vm = this;
        var _actions = {
            feedback: function () {
                modalDialog.info(
                    'If you are experiencing any problems with this extension or have questions or suggestions, ' +
                    'please email <a href="mailto:refigure@refigure.org">refigure@refigure.org</a>',
                    true
                );
            },
            uninstall: function (params) {
                if (params.email) {
                    var data = {
                        Email: params.email,
                        DateRemoved: Date.now()
                    };
                    return $http.post('/api/downloads', data);
                }
                // modalDialog.info(
                //     'If you are experiencing any problems with this extension or have questions or suggestions, ' +
                //     'please email <a href="mailto:refigure@refigure.org">refigure@refigure.org</a>',
                //     true
                // );
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
            var commands = parseHash();
            if (commands.action && typeof _actions[commands.action] === 'function') {
                _actions[commands.action](commands);
            }
        }

        function parseHash() {
            var ret = {};
            var hash = $location.hash();
            if (hash.trim() !== '') {
                var params = hash.split('&');
                params.forEach(function (param) {
                    var tmp = param.split('=');
                    if (tmp.length === 2) {
                        ret[tmp[0]] = tmp[1];
                    }
                });
            }
            return ret;
        }
    }
})(window.angular);
