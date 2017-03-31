/**
 * @ngdoc directive
 * @name refigureProfile.directive:myCollections
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
        .component('myCollections', {
            templateUrl: 'view/myCollections.component.html',
            controller: Controller,
            controllerAs: 'vm'
        });

    Controller.$inject = [
        'collections'
    ];

    function Controller(collections) {
        var vm = this;
        vm.error = null;
        vm.loading = false;
        vm.items = [];

        activate();

        /////////////////////

        /**
         * @ngdoc method
         * @name refigureProfile.directive:myCollections#activate
         * @methodOf refigureProfile.directive:myCollections
         * @description
         * Activates controller
         */
        function activate() {
            load();
        }

        /**
         * @ngdoc method
         * @name refigureProfile.directive:myCollections#load
         * @methodOf refigureProfile.directive:myCollections
         * @description
         * Loads component data
         */
        function load() {
            vm.error = null;
            vm.loading = true;
            collections
                .myCollections()
                .then(function (data) {
                    vm.items = data;
                })
                .finally(function () {
                    vm.loading = false;
                });
        }
    }
})(window.angular);
