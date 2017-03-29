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
        domEl.innerHTML = _tpl;
        document.body.appendChild(domEl);
        angular.bootstrap(domEl, ['EditFigureDialog'], {strictDi: true});
        _scope = angular.element(domEl).scope();
        return true;
    };

    var _tpl="";
    _tpl += "<div class=\"rf-popup\" ng-hide=\"hidden\">";
    _tpl += "    <div class=\"panel panel-primary\">";
    _tpl += "        <div class=\"panel-heading text-center\">Add figure to collection \"{{collection.Title}}\"<\/div>";
    _tpl += "        <div class=\"panel-body\">";
    _tpl += "            <div class=\"alert alert-info text-center\" ng-hide=\"collection.Figures.length\">Select an image to add to collection<\/div>";
    _tpl += "            <form name=\"figureForm_{{$index}}\" ng-repeat=\"fig in collection.Figures\">";
    _tpl += "                <div class=\"row\">";
    _tpl += "                    <div class=\"col-xs-4\">";
    _tpl += "                        <a href=\"#\" ng-click=\"opts.current = opts.current === $index ? -1 : $index\">";
    _tpl += "                            <img class=\"thumbnail\" ng-src=\"{{fig.URL}}\">";
    _tpl += "                        <\/a>";
    _tpl += "                    <\/div>";
    _tpl += "                    <div class=\"col-xs-8\">";
    _tpl += "                        <div class=\"caption\" ng-bind=\"fig.Caption\"><\/div>";
    _tpl += "                        <button type=\"button\" class=\"btn btn-link btn-xs\" ng-click=\"opts.current = opts.current === $index ? -1 : $index\">";
    _tpl += "                            <span ng-bind=\"opts.current === $index ? '-' : '+'\"><\/span>";
    _tpl += "                            <span ng-bind=\"opts.current === $index ? 'hide' : 'show'\"><\/span> details";
    _tpl += "                        <\/button>";
    _tpl += "                    <\/div>";
    _tpl += "                <\/div>";
    _tpl += "                <div class=\"row\" ng-show=\"opts.current === $index\">";
    _tpl += "                    <div class=\"container-fluid\">";
    _tpl += "                        <div class=\"form-group\">";
    _tpl += "                            <label for=\"edit-figure-url\">URL<\/label>";
    _tpl += "                            <input id=\"edit-figure-url\" type=\"text\" class=\"form-control\" ng-model=\"fig.URL\" readonly>";
    _tpl += "                        <\/div>";
    _tpl += "                        <div class=\"form-group\">";
    _tpl += "                            <label>Caption<\/label>";
    _tpl += "                            <div contenteditable=\"true\" class=\"form-control\" ng-model=\"collection.Figures[$index].Caption\"><\/div>";
    _tpl += "                        <\/div>";
    _tpl += "                        <div class=\"form-group\">";
    _tpl += "                            <label>Legend<\/label>";
    _tpl += "                            <div contenteditable=\"true\" class=\"form-control\" ng-model=\"fig.Legend\"><\/div>";
    _tpl += "                        <\/div>";
    _tpl += "                        <div class=\"form-group\">";
    _tpl += "                            <label for=\"edit-figure-features\">Features<\/label>";
    _tpl += "                            <input id=\"edit-figure-features\" type=\"text\" class=\"form-control\" ng-model=\"fig.Features\">";
    _tpl += "                        <\/div>";
    _tpl += "                        <div class=\"form-group\">";
    _tpl += "                            <label>Article authors<\/label>";
    _tpl += "                            <div contenteditable=\"true\" class=\"form-control\" ng-model=\"fig.Authors\"><\/div>";
    _tpl += "                        <\/div>";
    _tpl += "                        <div class=\"form-group\">";
    _tpl += "                            <label for=\"edit-figure-doi\">Article DOI<\/label>";
    _tpl += "                            <input id=\"edit-figure-doi\" type=\"text\" class=\"form-control\" ng-model=\"fig.DOI\">";
    _tpl += "                        <\/div>";
    _tpl += "                    <\/div>";
    _tpl += "                <\/div>";
    _tpl += "                <hr ng-hide=\"$last\">";
    _tpl += "            <\/form>";
    _tpl += "        <\/div>";
    _tpl += "        <div class=\"panel-footer\" ng-show=\"collection.Figures.length\">";
    _tpl += "            <div class=\"row\">";
    _tpl += "                <div class=\"col-xs-6\">";
    _tpl += "                    <button ng-click=\"dismiss()\" type=\"button\" class=\"btn btn-block btn-info\">Dismiss<\/button>";
    _tpl += "                <\/div>";
    _tpl += "                <div class=\"col-xs-6\">";
    _tpl += "                    <button ng-click=\"submit()\" class=\"btn btn-block btn-primary\">Submit<\/button>";
    _tpl += "                <\/div>";
    _tpl += "            <\/div>";
    _tpl += "        <\/div>";
    _tpl += "    <\/div>";
    _tpl += "<\/div>";

})(window.figurePopup || {});

angular.module('EditFigureDialog', [])
    .run(['$rootScope', function ($scope) {
        $scope.collection = {};
        $scope.opts = {
            current: -1
        };

        $scope.dismiss = function () {
            figureAddStop();
            $scope.hidden = true;
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
                };

                // Listen for change events to enable binding
                element.on('blur keyup change', function () {
                    scope.$evalAsync(read);
                });
                read(); // initialize

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