/**
 * @ngdoc directive
 * @name refigureApp.directive:collectionFlagged
 * @restrict E
 * @description
 * Search Results
 * @example
 * <collection-flagged></collection-flagged>
 */
(function (angular) {
    'use strict';

    angular
        .module('refigureShared')
        .component('collectionFlagged', {
            templateUrl: 'view/collectionFlagged.component.html',
            controller: Controller
        });

    Controller.$inject = ['$attrs'];

    function Controller($attrs) {
        $attrs.$observe('flagged', function (value) {
            if (value === '1') {
                $attrs.$removeClass('ng-hide');
            } else {
                $attrs.$addClass('ng-hide');
            }
        });
    }

})(window.angular);
