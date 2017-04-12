angular.module('ReFigureContent', [])
    .constant('USER_INFO', {})
    .config(['$httpProvider', 'USER_INFO', function ($httpProvider, USER_INFO) {
        //noinspection JSUnresolvedVariable
        chrome.storage.local.get('userInfo', function (data) {
            if (!data.userInfo) {
                alert(_gConst.ERROR_NOT_LOGGED);
            } else {
                USER_INFO = data.userInfo;
                $httpProvider.defaults.headers.common['Authentication'] = data.userInfo.Token;
            }
        });
    }])

    //add image functionality
    .run(['$rootScope', '$http', function ($scope, $http) {

        $scope.collection = {};
        $scope.opts = {
            current: -1
        };

        $scope.minimized = false;

        $scope.close = function () {
            window.figureAddStop();
            $scope.hidden = true;
        };

        $scope.toggle = function (index) {
            $scope.opts.current = $scope.opts.current === index ? -1 : index;
        };

        $scope.remove = function (index) {
            if (confirm('Remove this figure?')) {
                $http
                    .delete(_gApiURL + 'figure/' + $scope.collection.Figures[index].ID)
                    .then(function () {
                        $scope.collection.Figures.splice(index, 1);
                        window.searchFigures();
                    });
            }
        };

        $scope.saveFigure = function (data) {
            return $http
                .put(_gApiURL + 'figure', data)
                .then(function (resp) {
                    return resp.data.data.Figure;
                });
        };

        $scope.addFigure = function (data) {
            if (data.ID) {
                //noinspection JSUnresolvedFunction
                $scope.opts.current = $scope.collection.Figures.findIndex(function (el) {
                    return el.ID === data.ID;
                });
            } else {
                data.MetapublicationID = $scope.collection.ID;
                $scope.saveFigure(data).then(function (fig) {
                    $scope.collection.Figures.push(fig);
                    $scope.opts.current = $scope.collection.Figures.length - 1;
                    window.searchFigures();
                });
            }
        };
    }])

    //add collection functionality
    .run(['$rootScope', '$http', 'USER_INFO', function ($scope, $http, USER_INFO) {

        $scope.saveCollection = saveCollection;
        $scope.formData = {};

        ////////////////////////////

        function saveCollection(params) {
            if (!params.ID) {
                params.UserID = USER_INFO.ID;
                $http
                    .post(_gApiURL + 'metapublication', params)
                    .then(function (resp) {
                        $scope.close();
                        //noinspection JSUnresolvedVariable
                        chrome.storage.local.set({
                            Metapublication: resp.data.data.Metapublication
                        }, function () {
                            figureAddStart(resp.data.data.Metapublication);
                        });
                    });
            }
        }
    }])

    .directive('draggable', ['$document', function ($document) {
        return function (scope, element) {
            var startX = 0, startY = 0, x = 0, y = 0;
            var dialog = element.parent().parent().parent().parent();
            var dialogWidth = 400;
            var scrollWidth = 17;   //main body scroll width in chrome
            element.on('mousedown', function (event) {
                event.preventDefault();
                startX = window.innerWidth - event.screenX - x;
                startY = event.screenY - y;
                $document.on('mousemove', mouseMove);
                $document.on('mouseup', mouseUp);
            });

            function mouseMove(event) {
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

            function mouseUp() {
                $document.off('mousemove', mouseMove);
                $document.off('mouseup', mouseUp);
            }
        };
    }])

    .directive('contenteditable', [function () {
        return {
            restrict: 'A', // only activate on element attribute
            require: '?ngModel', // get a hold of NgModelController
            link: function (scope, element, attrs, ngModel) {
                if (!ngModel) {
                    return;
                }

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

                element.on('paste', function(e) {
                    e.preventDefault();
                    var text = e.clipboardData.getData('text/plain');
                    document.execCommand('insertHTML', false, text);
                });
            }
        };
    }]);