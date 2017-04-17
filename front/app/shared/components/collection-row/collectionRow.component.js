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
        .module('refigureShared')
        .component('collectionRow', {
            templateUrl: 'view/collectionRow.component.html',
            controllerAs: 'vm',
            bindings:{
                item: '<'
            }
        });

})(window.angular);
