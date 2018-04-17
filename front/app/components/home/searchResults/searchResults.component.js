/**
 * @ngdoc directive
 * @name refigureApp.directive:searchResults
 * @restrict E
 * @description
 * Search Results
 * @example
 * <search-results></search-results>
 */
(function (angular) {
    'use strict';

    angular
        .module('refigureApp')
        .component('searchResults', {
            templateUrl: 'view/searchResults.component.html',
            controller: Controller,
            controllerAs: 'vm'
        });

    Controller.$inject = ['$scope', '$state', '$mdMedia', 'collections', 'Analytics'];

    function Controller($scope, $state, $mdMedia, collections, Analytics) {
        var vm = this;

        vm.refigures = [];
        vm.found = 0;
        vm.searchParams = null;

        vm.submit = submit;
        vm.$onInit = activate();

        /////////////////////

        /**
         * @ngdoc method
         * @name refigureApp.directive:searchResults#activate
         * @methodOf refigureApp.directive:searchResults
         * @description
         * Activates controller
         */
        function activate() {
            if ($state.params.Flagged) {
                $state.get('home.search-results').data.headerTitle = 'Search results: flagged';
            }
            $scope.$watchCollection('vm.searchParams', function (params, old) {
                if (params) {
                    if (!old || params.query !== old.query) {
                        Analytics.trackEvent('Collection', 'search', params.query);
                    }
                    vm.term = params.query;
                    load(params);
                }
            });
        }

        /**
         * @ngdoc method
         * @name refigureApp.directive:searchResults#load
         * @methodOf refigureApp.directive:searchResults
         * @param {Object} params state params
         * @description
         * Loads component data
         */
        function load(params) {
            collections.search(params).then(function (data) {
                vm.refigures = data.results;
                vm.found = data.found;
                //blur input to remove display keyboard
                if ($mdMedia('sm') || $mdMedia('xs')) {
                    document.getElementById('search-term').blur();
                }
            });
        }

        /**
         * @ngdoc method
         * @name refigureApp.directive:searchResults#submit
         * @methodOf refigureApp.directive:searchResults
         * @description
         * Runs search
         */
        function submit() {
            $state.go('home.search-results', {
                from: 0,
                query: vm.term
            });
        }
    }
})(window.angular);
