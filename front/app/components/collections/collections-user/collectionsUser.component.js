/**
 * @ngdoc directive
 * @name refigureApp.directive:collectionsUser
 * @restrict E
 * @description
 * All user's collections
 * @example
 * <collections-item></collections-item>
 */
(function (angular) {
    'use strict';

    angular
        .module('refigureApp')
        .component('collectionsUser', {
            templateUrl: 'view/collectionsUser.component.html',
            controllerAs: 'vm',
            controller: ItemController
        });

    ItemController.$inject = [
        '$scope',
        '$state',
        'collections'
    ];

    function ItemController($scope, $state, collections) {
        var vm = this;
        vm.found = 0;
        vm.refigures = [];
        vm.user = null;
        vm.searchParams = null;

        vm.$onInit = activate;

        ///////////////////////////////////////////

        function activate() {
            $scope.$watchCollection('vm.searchParams', function (params) {
                console.log('params', params);
                if (params) {
                    load(params);
                }
            });
        }

        function load(params) {
            $state.get('collections.user').data.headerTitle = '';
            collections
                .search(params)
                .then(function (res) {
                    vm.refigures = res.results;
                    vm.found = res.found;
                    if (vm.refigures.length) {
                        vm.user = vm.refigures[0].User;
                        $state.get('collections.user').data.headerTitle = ' by ' + vm.user.FullName;
                    }
                });
        }
    }
})(window.angular);
