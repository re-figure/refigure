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
        '$state',
        'rfUsers',
        'rfToast',
        'modalDialog'
    ];

    function Controller($scope, $state, rfUsers, rfToast, modal) {
        var vm = this;

        vm.users = [];
        vm.searchParams = null;
        vm.found = 0;
        vm.fakeTrueValue = true;
        vm.term = '';

        vm.remove = remove;
        vm.save = save;
        vm.submit = submit;
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
                    vm.term = params.query;
                    load(params);
                }
            });

            $scope.$watch('vm.sidebarOpened', function (val) {
                if (val !== undefined && !val) {
                    $state.go('profile.users', {user: null});
                    vm.user = null;
                }
            });

            //pseudo state change
            $scope.$watch(function () {
                return $state.params.user;
            }, function (UserID) {
                if (UserID) {
                    rfUsers
                        .get(UserID)
                        .then(function (resp) {
                            vm.sidebarOpened = true;
                            vm.user = resp;
                        });
                }
            });
        }

        function submit() {
            $state.go($state.current.name, {
                query: vm.term,
                from: 0
            });
        }

        function load(params) {
            rfUsers.search(params)
                .then(function (resp) {
                    vm.users = resp.results;
                    vm.found = resp.found;
                });
        }

        function remove(e, index) {
            e.stopPropagation();
            modal
                .confirm('Are you sure you would like to delete this user permanently?')
                .then(function () {
                    rfUsers
                        .remove(vm.users[index].ID)
                        .then(function () {
                            vm.users.splice(index, 1);
                            vm.found--;
                            rfToast.show('User removed');
                        }, angular.noop);
                });
        }

        /**
         * @ngdoc method
         * @name refigureShared.directives:collectionEdit#saveRefigure
         * @methodOf refigureShared.directives:collectionEdit
         * @description
         * Saves collection
         */
        function save() {
            vm.loading = true;
            rfUsers
                .save(vm.user)
                .then(function (updated) {
                    rfToast.show('User updated');
                    vm.users.forEach(function (usr) {
                        if (usr.ID === updated.ID) {
                            angular.extend(usr, updated);
                        }
                    });
                    vm.sidebarOpened = false;
                })
                .finally(function () {
                    vm.loading = false;
                });
        }

    }
})(window.angular);
