/**
 * @ngdoc directive
 * @name refigureApp.directive:uiSrefDisabled
 * @restrict E
 * @description
 * Enables clicks simple <a> functionality under ui-sref links
 * @example
 * <div ui-sref="stateName">
 *     <a ui-sref-disabled ng-href="mailto:test@test.org">test@test.org</a>
 * </div>
 */
(function (angular) {
    'use strict';

    angular
        .module('refigureShared')
        .directive('uiSrefDisabled', Directive);

    function Directive () {
        return {
            restrict: 'A',
            link: function ($scope, $element) {
                $element.on('click', function (e) {
                    e.stopPropagation();
                });
            }
        };
    }

})(window.angular);
