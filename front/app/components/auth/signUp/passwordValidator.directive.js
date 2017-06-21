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
                            console.log('pass-length', false);
                            ngModel.$setValidity('pass-length', false);
                        } else {
                            console.log('pass-length', true);
                            ngModel.$setValidity('pass-length', true);
                        }

                        if (value === value.toLowerCase()) {
                            console.log('pass-uppercase', false);
                            ngModel.$setValidity('pass-uppercase', false);
                        } else {
                            console.log('pass-uppercase', true);
                            ngModel.$setValidity('pass-uppercase', true);
                        }

                        if (value === value.toUpperCase()) {
                            console.log('pass-lowercase', false);
                            ngModel.$setValidity('pass-lowercase', false);
                        } else {
                            console.log('pass-lowercase', true);
                            ngModel.$setValidity('pass-lowercase', true);
                        }

                        if (!value.match(/.*[\W\d]+.*/)) {
                            console.log('pass-chars', false);
                            ngModel.$setValidity('pass-chars', false);
                        } else {
                            console.log('pass-chars', true);
                            ngModel.$setValidity('pass-chars', true);
                        }
                    }

                    return value;
                });
            }
        };
    }

})(window.angular);
