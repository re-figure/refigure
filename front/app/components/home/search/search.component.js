/**
 * @ngdoc directive
 * @name refigureApp.directive:search
 * @restrict E
 * @description
 * Search page
 * @example
 * <search></search>
 */
(function (angular) {
    'use strict';

    angular
        .module('refigureApp')
        .component('search', {
            templateUrl: 'view/search.component.html',
            controller: Controller,
            controllerAs: 'vm'
        });

    Controller.$inject = [
        '$state',
        'collections'
    ];

    function Controller($state, collections) {
        var vm = this;
        vm.form = null;
        vm.searchTerm = '';
        vm.mostVisited = [];

        vm.submit = submit;

        activate();

        /////////////////////

        /**
         * @ngdoc method
         * @name refigureApp.directive:search#activate
         * @methodOf refigureApp.directive:search
         * @description
         * Activates controller
         */
        function activate() {
            load();
        }

        /**
         * @ngdoc method
         * @name refigureProfile.directive:accountSettings#load
         * @methodOf refigureProfile.directive:accountSettings
         * @description
         * Loads component data
         */
        function load() {
            vm.loading = true;
            collections
                .mostVisited({
                    limit: 3
                })
                .then(function (ret) {
                    vm.mostVisited = ret;
                })
                .finally(function () {
                    vm.loading = false;
                });
        }

        /**
         * @ngdoc method
         * @name refigureApp.directive:search#submit
         * @methodOf refigureApp.directive:search
         * @description
         * Runs search
         */
        function submit() {
            $state.go('home.search-results', {
                term: vm.searchTerm
            });
        }
    }
})(window.angular);
