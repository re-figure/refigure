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
        '$scope',
        'collections'
    ];
    //collectionEditService
    function Controller($scope, collections) {
        var vm = this;

        vm.$onInit = activate;

        /////////////////////

        /**
         * @ngdoc method
         * @name refigureProfile.directive:myCollections#activate
         * @methodOf refigureProfile.directive:myCollections
         * @description
         * Activates controller
         */
        function activate() {

        }

    }
})(window.angular);
