(function (self) {

    var _scope = null;

    self.show = function () {
        if (!_scope) {
            self.create();
        }
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
        domEl.innerHTML = '<div ng-include="\'view/addRefigure.html\'"></div>';
        document.body.appendChild(domEl);
        angular.bootstrap(domEl, ['ReFigureContent'], {strictDi: true});
        _scope = angular.element(domEl).scope();
        return true;
    };

})(window.refigurePopup || {});
