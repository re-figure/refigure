(function (angular) {

    angular.module('refigureAuth')
        .directive('passwordValidator', Controller);

    Controller.$inject = [];

    function Controller() {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function (scope, element, attrs, ngModel) {
                ngModel.$parsers.push(function (value) {
                    if (value) {
                        if (value.length < 8) {
                            ngModel.$setValidity('pass-length', false);
                        } else {
                            ngModel.$setValidity('pass-length', true);
                        }

                        if (value === value.toLowerCase()) {
                            ngModel.$setValidity('pass-uppercase', false);
                        } else {
                            ngModel.$setValidity('pass-uppercase', true);
                        }

                        if (value === value.toUpperCase()) {
                            ngModel.$setValidity('pass-lowercase', false);
                        } else {
                            ngModel.$setValidity('pass-lowercase', true);
                        }

                        if (!value.match(/.*[\W\d]+.*/)) {
                            ngModel.$setValidity('pass-chars', false);
                        } else {
                            ngModel.$setValidity('pass-chars', true);
                        }
                    }

                    return value;
                });
            }
        };
    }

})(window.angular);
