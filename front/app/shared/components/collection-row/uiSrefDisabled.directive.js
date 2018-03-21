/**
 * @ngdoc directive
 * @name refigureApp.directive:uiSrefDisabled
 * @restrict E
 * @description
 * Stops propagation on click to prevent ui-sref links to work
 * Accepts selector as value of attribute to search for
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
            link: function ($scope, $element, $attr) {
                $element.on('click', function (e) {
                    if (!$attr['uiSrefDisabled'] || e.target.matches($attr['uiSrefDisabled'])) {
                        e.stopPropagation();
                    }
                });
            }
        };
    }

})(window.angular);
