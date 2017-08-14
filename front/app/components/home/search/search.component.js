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
        '$timeout',
        'collections',
        'chromeService',
        'MESSAGES'
    ];

    function Controller($state, $timeout, collections, chromeService, MESSAGES) {
        var vm = this;
        vm.form = null;
        vm.mostVisited = [];
        vm.isChrome = false;

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
            vm.isChrome = !!window.navigator.userAgent.match(/Chrome/);
            chromeService.sendMessage({
                type: MESSAGES.MSG_TYPE_IS_EXTENSION_INSTALLED
            }, function (resp) {
                if (resp && resp.success) {
                    $timeout(function () {
                        vm.isChrome = false;
                    });
                }
            });
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
                query: vm.term
            });
        }
    }
})(window.angular);
