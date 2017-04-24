/**
 * @ngdoc directive
 * @name refigureProfile.directive:dashboard
 * @restrict E
 * @description
 * Profile page
 * @example
 * <my-collections></my-collections>
 */
(function (angular) {
    'use strict';

    angular
        .module('refigureProfile')
        .component('dashboard', {
            templateUrl: 'view/dashboard.component.html',
            controller: Controller,
            controllerAs: 'vm'
        });

    Controller.$inject = [
        'collections'
    ];

    function Controller(collections) {
        var vm = this;
        vm.stats = null;

        vm.$onInit = activate;

        /////////////////////

        /**
         * @ngdoc method
         * @name refigureProfile.directive:dashboard#activate
         * @methodOf refigureProfile.directive:dashboard
         * @description
         * Activates controller
         */
        function activate() {
            collections.statistics()
                .then(function (resp) {
                    vm.stats = resp;
                });
        }

    }
})(window.angular);
