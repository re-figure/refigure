(function () {

    angular.module('ReFigure')
        .component('foundFigures', {
            templateUrl: 'view/foundFigures.component.html',
            controller: CtrlFunction,
            controllerAs: 'vm'
        });

    CtrlFunction.$inject = ['$timeout', 'STORAGE', 'MessageService'];
    function CtrlFunction($timeout, STORAGE, MessageService) {
        var vm = this;
        vm.figures = STORAGE.foundFigures;
        vm.opened = -1;
        vm.$onInit = activate;
        vm.showFull = showFull;
        vm.toClipboard = toClipboard;

        /////////////////////

        function activate() {
        }

        function showFull(src) {
            MessageService.showWindow({
                content: '<img src="' + src + '">'
            });
        }

        function toClipboard(event, key, figure) {
            if (!figure.clip) {
                figure.clip = {};
                figure.clip[key] = false;
            }
            window.getSelection().removeAllRanges();

            var range = document.createRange();
            //assuming that next element is always the required target
            range.selectNode(event.target.nextElementSibling);
            window.getSelection().addRange(range);

            try {
                document.execCommand('copy');
                figure.clip[key] = 'ok';
            } catch(err) {
                MessageService.showMessage({
                    text: 'Oops, unable to copy'
                });
                figure.clip[key] = 'error';
            }
            $timeout(function () {
                figure.clip[key] = false;
            }, 1000);
            window.getSelection().removeAllRanges();
        }
    }
})();
