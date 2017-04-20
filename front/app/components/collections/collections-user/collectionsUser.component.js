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
        '$stateParams',
        'collections'
    ];

    function ItemController($stateParams, collections) {
        var vm = this;

        vm.$onInit = activate;

        ///////////////////////////////////////////

        function activate() {
            console.log($stateParams);
        }
    }
})(window.angular);
