/**
 * @ngdoc directive
 * @name refigureApp.directive:visitsCount
 * @restrict E
 * @description
 * Search Results
 * @example
 * <visits-count></visits-count>
 */
(function (angular) {
    'use strict';

    angular
        .module('refigureShared')
        .component('visitsCount', {
            templateUrl: 'view/visitsCount.component.html',
            controllerAs: 'vm',
            bindings:{
                count: '<'
            }
        });

})(window.angular);
