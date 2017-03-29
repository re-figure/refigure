(function (self) {

    var _scope = null;

    self.show = function (data, collection) {
        !_scope && self.create();
        // TODO check if the figure exists in the current collection
        // if so, then use UPDATE then not CREATE
        _scope.$apply(function () {
            _scope.hidden = false;
            if (collection && _scope.collection.ID !== collection.ID) {
                _scope.collection = angular.copy(collection);
                console.log('Starting collection:', angular.copy(_scope.collection));
                _scope.opts.current = 0;
            }
            if(data){
                _scope.collection.Figures.push(data);
                _scope.opts.current = _scope.collection.Figures.length - 1;
            }
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
        //domEl.setAttribute('ng-include', "'view/dialog.html'");
        //domEl.setAttribute('src', 'view/dialog.html');
        domEl.innerHTML = '<div ng-include="\'view/dialog.html\'"></div>';
        document.body.appendChild(domEl);
        angular.bootstrap(domEl, ['ReFigureContent'], {strictDi: true});
        _scope = angular.element(domEl).scope();
        return true;
    };

})(window.figurePopup || {});

angular.module('ReFigureContent', [])
    .run(['$rootScope', function ($scope) {
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
            if ($scope.collection.Figures[index].ID) {
                console.error('!!!removing from server!!!');
            } else {
                $scope.collection.Figures.splice(index, 1)
            }
        };

        $scope.submit = function (index) {
            /*chrome.storage.local.get('userInfo', function (data) {
                if (data.userInfo) {
                    var requestNumber = $scope.collection.Figures.length;
                    var requestCounter = 0;
                    var figures = angular.copy($scope.collection.Figures);
                    var figure = figures.pop();
                    while (figure) {
                        figure.MetapublicationID = $scope.collection.ID;
                        sendRequest({
                            type: 'POST',
                            url: 'figure',
                            data: figure,
                            headers: {
                                Authentication: data.userInfo.Token
                            }
                        }).then(function () {
                            requestCounter++;
                            if (requestCounter === requestNumber) {
                                window.figurePopup.hide();
                                alert(_gConst.FIGURE_ADDED);
                            }
                        }, function (data) {
                            console.log(data);
                        });
                        figure = figures.pop();
                    }
                } else {
                    alert(_gConst.ERROR_NOT_LOGGED);
                }
            });*/
            console.log(index, $scope.collection.Figures);
            //figureAddStop();
        }
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