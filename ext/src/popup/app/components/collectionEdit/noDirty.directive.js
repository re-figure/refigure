(function (angular) {

    angular.module('ReFigure')
        .directive('noDirty', function () {
            return {
                restrict: 'A',
                require: 'ngModel',
                link: function (scope, element, attrs, ngModelCtrl) {
                    // override the $setDirty method on ngModelController
                    ngModelCtrl.$setDirty = angular.noop;
                }
            }
        });

})(window.angular);
