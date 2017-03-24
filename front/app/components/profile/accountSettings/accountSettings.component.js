/**
 * @ngdoc directive
 * @name refigureProfile.directive:accountSettings
 * @restrict E
 * @description
 * Account settings page
 * @example
 * <account-settings></account-settings>
 */
(function(angular) {
    'use strict';

    angular
        .module('refigureProfile')
        .component('accountSettings', {
            templateUrl: 'view/accountSettings.component.html',
            controller: Controller,
            controllerAs: 'vm'
        });

    Controller.$inject = [];

    function Controller() {
        var vm = this;

        activate();

        /////////////////////

        function activate() {

        }
    }
})(window.angular);
