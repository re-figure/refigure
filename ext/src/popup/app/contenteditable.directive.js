(function (angular) {

    angular.module('ReFigure')
        .directive('contenteditable', Controller);

    Controller.$inject = [];

    function Controller() {
        return {
            restrict: 'A', // only activate on element attribute
            require: '?ngModel', // get a hold of NgModelController
            link: function (scope, element, attrs, ngModel) {
                if (!ngModel) return; // do nothing if no ng-model

                // Specify how UI should be updated
                ngModel.$render = function () {
                    element.html(ngModel.$viewValue || '');
                    read(); // initialize
                };

                // Listen for change events to enable binding
                element.on('blur keyup change', function () {
                    scope.$evalAsync(read);
                });

                // Write data to the model
                function read() {
                    var html = element.html();
                    // When we clear the content editable the browser leaves a <br> behind
                    // If strip-br attribute is provided then we strip this out
                    if (attrs.stripBr && html === '<br>') {
                        html = '';
                    }
                    ngModel.$setViewValue(html);
                }

                var label = element.next();
                if (label[0].tagName === 'LABEL') {
                    label.on('click', function () {
                        element[0].focus();
                    });
                }

                element.on('paste', function(e) {
                    e.preventDefault();
                    var text = e.clipboardData.getData('text/plain');
                    document.execCommand('insertHTML', false, text);
                });
            }
        };
    }

})(window.angular);
