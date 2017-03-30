(function (angular) {

    angular.module('ReFigure')
        .directive('plural', Controller);

    Controller.$inject = [];

    function Controller() {
        return {
            restrict: 'A',
            link: function ($scope, $element, $attrs) {
                var word = $element.text();
                $scope.$watch($attrs.plural, function (newVal) {
                    $element.text(word + (newVal === 1 ? '' : 's'));
                });
            }
        }
    }

})(window.angular);
