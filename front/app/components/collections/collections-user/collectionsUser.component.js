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
        'collections',
        'auth'
    ];

    function ItemController($scope, $state, collections, auth) {
        var vm = this;
        vm.total = 0;
        vm.result = [];
        vm.user = null;
        vm.searchParams = {
            query: '"' + $state.params.id + '"',
            from: 0,
            size: 5,
            sortDirection: '',
            sortField: ''
        };

        vm.$onInit = activate;

        ///////////////////////////////////////////

        function activate() {
            $scope.$watchCollection('vm.searchParams', load);
        }

        function load() {
            collections.search(vm.searchParams).then(function (res) {
                vm.results = res.results;
                vm.total = res.found;
                if (vm.results.length) {
                    vm.user = vm.results[0].User;
                    auth.setUsrNames(vm.user);
                    $state.current.data.headerTitle = ' by ' + vm.user.FullName + '';
                }
            });
        }
    }
})(window.angular);
