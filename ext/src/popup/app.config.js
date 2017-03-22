(function (angular) {

    //debug page chrome-extension://eomljbidagegcimpgnpmmejnjbcfpdgo/popup/popup.html
    angular.module('ReFigure')
        .value('Opts', {
            CURRENT_TAB: null
        })
        .config(ConfigController)
        .run(RunController);

    function ConfigController() {
    }

    RunController.$inject = ['Opts'];

    function RunController(Opts) {
        chrome.tabs.query({
            active: true,
            currentWindow: true
        }, function (res) {
            Opts.CURRENT_TAB = res[0].id;
        });
    }

})(window.angular);