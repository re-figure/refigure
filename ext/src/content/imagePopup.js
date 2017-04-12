(function (self) {

    var _scope = null;

    self.show = function (data, collection) {
        if (!_scope) {
            self.create();
        }
        // TODO check if the figure exists in the current collection
        // if so, then use UPDATE then not CREATE
        _scope.$apply(function () {
            _scope.hidden = false;
            console.log(_scope.collection);
            if (collection && (!_scope.collection || _scope.collection.ID !== collection.ID)) {
                _scope.collection = collection;
                console.info('Starting refigure:', angular.copy(_scope.collection));
                _scope.opts.current = -1;
            }
            if (data) {
                _scope.addFigure(data);
            }
            _scope.minimized = false;
        });
    };

    self.hide = function () {
        if (_scope) {
            _scope.$apply(function () {
                _scope.hidden = true;
            });
        }
    };

    self.create = function () {
        if (_scope) {
            return false;
        }
        var domEl = document.createElement('div');
        domEl.innerHTML = '<div ng-include="\'view/addImage.html\'"></div>';
        document.body.appendChild(domEl);
        angular.bootstrap(domEl, ['ReFigureContent'], {strictDi: true});
        _scope = angular.element(domEl).scope();
        return true;
    };

})(window.imagePopup || {});
