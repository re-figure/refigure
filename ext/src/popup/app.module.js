//debug page chrome-extension://eomljbidagegcimpgnpmmejnjbcfpdgo/popup/popup.html
var CURRENT_TAB = null;
chrome.tabs.query({
    active: true,
    currentWindow: true
}, function (res) {
    CURRENT_TAB = res[0].id;
});

angular.module('ReFigure', [])
    .controller('MainCtrl', ['$scope', function ($scope) {

        var FIGURES = [];

        $scope.selected = [];
        $scope.error = '';
        $scope.figCount = 0;
        $scope.isAuthenticated = false;

        $scope.figureAddStart = function () {
            $scope.error = '';
            chrome.tabs.sendMessage(CURRENT_TAB, {
                type: _gConst.MSG_TYPE_ADD_START
            });
        };

        $scope.remove = function (index) {
            $scope.selected.splice(index, 1);
            chrome.storage.local.set({
                rfSelected: angular.copy($scope.selected)   //clear $hasKey
            });
        };

        $scope.login = function () {
            chrome.storage.local.set({
                userInfo: {isAuthenticated: true}
            });
            chrome.runtime.sendMessage({
                type: _gConst.MSG_TYPE_USER_LOGGED_IN
            });
            $scope.isAuthenticated = true;
        };

        $scope.logout = function () {
            chrome.storage.local.set({
                userInfo: {isAuthenticated: false}
            });
            chrome.runtime.sendMessage({
                type: _gConst.MSG_TYPE_USER_LOGGED_OUT
            });
            $scope.isAuthenticated = false;
        };

        activate();

        /////////////////////////

        function activate() {
            chrome.storage.local.get('rfFigures', function (data) {
                $scope.$apply(function () {
                    FIGURES = data.rfFigures || [];
                    $scope.figCount = FIGURES.length;
                });
            });

            chrome.storage.local.get('rfSelected', function (data) {
                $scope.$apply(function () {
                    $scope.selected = data.rfSelected ? dedupFigures(data.rfSelected) : $scope.selected;
                })
            });

            chrome.storage.local.get('userInfo', function (data) {
                $scope.$apply(function () {
                    $scope.isAuthenticated = data.userInfo.isAuthenticated ? data.userInfo.isAuthenticated : false;
                })
            });

            chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
                    if (sender.tab && request.type === _gConst.MSG_TYPE_ADD_COMPLETED) {
                        var selectedImage = searchImage(request.src);
                        if (selectedImage) {
                            $scope.selected.push(selectedImage);
                            $scope.selected = dedupFigures($scope.selected);
                            chrome.storage.local.set({
                                rfSelected: angular.copy($scope.selected)   //clear $hasKey
                            });
                        }
                        $scope.$apply();
                    }
                    if (sender.tab && request.type === _gConst.MSG_TYPE_SEARCH_COMPLETED) {
                        FIGURES = request.figures;
                        $scope.$apply(function () {
                            $scope.figCount = FIGURES.length;
                        });
                    }
                    return true;
                }
            );
        }

        function searchImage(src) {
            var img = FIGURES.find(function (el) {
                return el.URL === src;
            });
            if (!img) {
                $scope.error = _gConst.POPUP_ERROR_FIG_NOT_PARSED;
                return false;
            }

            var isDup = $scope.selected.find(function (el) {
                return el.URL === src;
            });

            if (isDup) {
                $scope.error = _gConst.POPUP_ERROR_FIG_DUPLICATE;
                return false;
            }
            return img;
        }

        function dedupFigures(figures) {
            var deduped = [];
            for (var i = 0; i < figures.length; ++i) {
                var found = false;
                for (var j = 0; j < deduped.length; ++j) {
                    if (figures[i].URL && figures[i].URL.toLowerCase() === deduped[j].URL.toLowerCase()) {
                        found = true;
                        break;
                    }
                    if (figures[i].DOIFigure && deduped[j].DOIFigure && figures[i].DOIFigure.toLowerCase() === deduped[j].DOIFigure.toLowerCase()) {
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    deduped.push(figures[i]);
                }
            }
            return deduped;
        }

    }]);
