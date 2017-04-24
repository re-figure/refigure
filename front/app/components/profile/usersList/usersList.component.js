/**
 * @ngdoc directive
 * @name refigureProfile.directive:usersList
 * @restrict E
 * @description
 * Profile page
 * @example
 * <users-list></users-list>
 */
(function (angular) {
    'use strict';

    angular
        .module('refigureProfile')
        .component('usersList', {
            templateUrl: 'view/usersList.component.html',
            controller: Controller,
            controllerAs: 'vm'
        });

    Controller.$inject = [
        '$scope',
        'rfUsers'
    ];

    function Controller($scope, rfUsers) {
        var vm = this;
        vm.users = [];
        vm.searchParams = null;
        vm.found = 0;

        vm.$onInit = activate;

        /////////////////////

        /**
         * @ngdoc method
         * @name refigureProfile.directive:usersList#activate
         * @methodOf refigureProfile.directive:usersList
         * @description
         * Activates controller
         */
        function activate() {
            $scope.$watchCollection('vm.searchParams', function (params) {
                if (params) {
                    load(params);
                }
            });
        }

        function load(params) {
            rfUsers.search(params)
                .then(function (resp) {
                    vm.users = resp.results;
                    vm.found = resp.found;
                });
        }

    }
})(window.angular);
