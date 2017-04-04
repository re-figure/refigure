(function (self) {

    var _scope = null;

    self.show = function (data, collection) {
        !_scope && self.create();
        // TODO check if the figure exists in the current collection
        // if so, then use UPDATE then not CREATE
        _scope.$apply(function () {
            _scope.hidden = false;
            if (collection && _scope.collection.ID !== collection.ID) {
                //TODO why copy? there should be just a reference
                _scope.collection = collection; //angular.copy(collection);
                console.log('Starting collection:', angular.copy(_scope.collection));
                _scope.opts.current = -1;
            }
            data && _scope.addFigure(data);
            _scope.minimized = false
        });
    };

    self.hide = function () {
        _scope && _scope.$apply(function () {
            _scope.hidden = true;
        });
    };

    self.create = function () {
        if (_scope) {
            return false;
        }
        var domEl = document.createElement('div');
        domEl.innerHTML = '<div ng-include="\'view/dialog.html\'"></div>';
        document.body.appendChild(domEl);
        angular.bootstrap(domEl, ['ReFigureContent'], {strictDi: true});
        _scope = angular.element(domEl).scope();
        return true;
    };

})(window.figurePopup || {});

angular.module('ReFigureContent', [])
    .config(['$httpProvider', function ($httpProvider) {
        chrome.storage.local.get('userInfo', function (data) {
            if (!data.userInfo) {
                alert(_gConst.ERROR_NOT_LOGGED);
            } else {
                $httpProvider.defaults.headers.common['Authentication'] = data.userInfo.Token;
            }
        });
    }])
    .run(['$rootScope', '$http', function ($scope, $http) {

        $scope.collection = {};
        $scope.opts = {
            current: -1
        };

        $scope.minimized = false;

        $scope.close = function () {
            figureAddStop();
            $scope.hidden = true;
        };

        $scope.toggle = function (index) {
            $scope.opts.current = $scope.opts.current === index ? -1 : index;
        };

        $scope.remove = function (index) {
            if (confirm('Remove this figure?')) {
                $http
                    .delete(_gApiURL + "figure/" + $scope.collection.Figures[index].ID)
                    .then(function () {
                        $scope.collection.Figures.splice(index, 1);
                    });
            }
        };

        $scope.saveFigure = function (data) {
            return $http
                .put(_gApiURL + "figure", data)
                .then(function (resp) {
                    return resp.data.data.Figure;
                });
        };

        $scope.addFigure = function (data) {
            if (data.ID) {
                $scope.opts.current = $scope.collection.Figures.findIndex(function (el) {
                    return el.ID === data.ID;
                });
            } else {
                data.MetapublicationID = $scope.collection.ID;
                $scope.saveFigure(data).then(function (fig) {
                    $scope.collection.Figures.push(fig);
                    $scope.opts.current = $scope.collection.Figures.length - 1;
                });
            }
        };
    }])

    .directive('draggable', ['$document', function ($document) {
        return function (scope, element) {
            var startX = 0, startY = 0, x = 0, y = 0;
            var dialog = element.parent().parent().parent().parent();
            var dialogWidth = 400;
            var scrollWidth = 17;   //main body scroll width in chrome
            console.log(dialog);
            element.on('mousedown', function (event) {
                event.preventDefault();
                startX = window.innerWidth - event.screenX - x;
                startY = event.screenY - y;
                $document.on('mousemove', mousemove);
                $document.on('mouseup', mouseup);
            });

            function mousemove(event) {
                x = window.innerWidth - event.screenX - startX;
                y = event.screenY - startY;
                if (y < 0) {
                    y = 0;
                }
                if (y > window.innerHeight - dialog[0].offsetHeight) {
                    y = window.innerHeight - dialog[0].offsetHeight;
                }

                if (x < 0) {
                    x = 0;
                }
                if (x > window.innerWidth - dialogWidth - scrollWidth) {
                    x = window.innerWidth - dialogWidth - scrollWidth;
                }
                dialog.css({
                    right: x + 'px',
                    top: y + 'px'
                });
            }

            function mouseup() {
                $document.off('mousemove', mousemove);
                $document.off('mouseup', mouseup);
            }
        };
    }])

    .directive('contenteditable', [function () {
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
            }
        };
    }]);