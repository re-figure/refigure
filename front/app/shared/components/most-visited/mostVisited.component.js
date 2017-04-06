/**
 * @ngdoc directive
 * @name refigureApp.directive:mostVisited
 * @restrict E
 * @description
 * Search Results
 * @example
 * <most-visited></most-visited>
 */
(function (angular) {
    'use strict';

    angular
        .module('refigureApp')
        .component('mostVisited', {
            templateUrl: 'view/mostVisited.component.html',
            controllerAs: 'vm',
            bindings:{
                count: '<'
            }
        });

})(window.angular);
