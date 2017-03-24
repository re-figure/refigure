/**
 * @ngdoc directive
 * @name ui.ap.directives:autoFocus
 * @param {String=} autoFocus       O/false/off/no defines whether auto focus
 *                                  should be applied or not
 * @param {Number}  focusDelay      ms to wait before focus
 * @param {String}  autoSelect      in case auto focus applies to input type text
 *                                  or text area it allows to auto select text on focus.
 * @restrict A
 * @description
 * Autofocus directive
 * It allows to make element focused by default
 * @example
 * <pre>
 *     <input type=text auto-focus/>
 *     <div auto-focus>
 *         .....
 *         <textarea></textarea>
 *         .....
 *     </div>
 *     <button auto-focus focus-delay="1000">
 *     </button>
 * </pre>
 */
(function (angular) {
    'use strict';

    angular
        .module('ui.ap.autoFocus', [])
        .directive('autoFocus', autoFocus);

    autoFocus.$inject = ['$timeout'];

    function autoFocus($timeout) {
        var directive = {
            restrict: 'A',
            link: link
        };

        return directive;

        /**
         * Link function
         */
        function link(scope, element, attrs, controller) {
            var autoFocus = attrs.autoFocus;
            if (autoFocus && autoFocus.match(/(0|f|n|off)/i)) {
                autoFocus = false;
            }
            if (autoFocus !== false && !attrs.autoFocused) {
                var delay = angular.isDefined(attrs.focusDelay) ? attrs.focusDelay : 10;
                $timeout(function () {
                    setFocus(element, attrs);
                }, delay);
            }
        }

        /**
         * @ngdoc method
         * @name ui.ap.directives:autoFocus#setFocus
         * @methodOf ui.ap.directives:autoFocus
         * @param {Object} element  DOM element
         * @param {Object} attrs    DOM element attributes
         * @description
         * It focus the specified element
         */
        function setFocus(element, attrs) {
            attrs.autoFocused = true;
            var types = [
                'input:first',
                'textarea:first',
                'button:first',
                'a:first'
            ];
            var el;
            angular.forEach(types, function (_t) {
                if (!el) {
                    var _el = element.find(_t);
                    if (_el && _el.length) {
                        el = _el;
                    }
                }
            });
            if (!el) {
                el = element;
            }
            el[0].focus();
            if (angular.isDefined(attrs.autoSelect)) {
                select(el);
            }
        }

        /**
         * @ngdoc method
         * @name ui.ap.directives:autoFocus#select
         * @methodOf ui.ap.directives:autoFocus
         * @description
         * It selects text
         */
        function select(element) {
            element[0].select();
        }
    }
})(window.angular);
