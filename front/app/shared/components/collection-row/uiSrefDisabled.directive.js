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

    // .matches polyfill for IE (even IE11)
    if (!Element.prototype.matches) {
        Element.prototype.matches =
            Element.prototype.matchesSelector ||
            Element.prototype.mozMatchesSelector ||
            Element.prototype.msMatchesSelector ||
            Element.prototype.oMatchesSelector ||
            Element.prototype.webkitMatchesSelector ||
            function(s) {
                var matches = (this.document || this.ownerDocument).querySelectorAll(s),
                    i = matches.length;
                while (--i >= 0 && matches.item(i) !== this) {}
                return i > -1;
            };
    }

})(window.angular);
