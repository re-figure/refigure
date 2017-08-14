// (function (parser) {
//     parser.CONTENT_BLOCK_SELECTOR = 'collections-item';
//
//     parser.parseFigures = function () {
//         var btn = Sizzle('.r-download-extension');
//         if (btn.length) {
//             btn[0].style.visibility = 'hidden';
//         }
//         if (!Sizzle(parser.CONTENT_BLOCK_SELECTOR).length) {
//             chrome.runtime.sendMessage({
//                 type: _gConst.MSG_TYPE_BADGE_NA
//             });
//         }
//
//         return new Promise(function (resolve) {
//             window.addEventListener('message', function (event) {
//                 var images = [];
//                 if (event.data && event.data.images) {
//                     images = event.data.images.map(function (img) {
//                         return {
//                             Authors: img.Authors,
//                             Caption: img.Caption,
//                             DOI: img.DOI,
//                             DOIFigure: img.DOIFigure,
//                             Legend: img.Legend,
//                             URL: img.URL,
//                             Features: img.Features
//                         };
//                     });
//                 }
//                 resolve(images);
//             }, false);
//         });
//     };
//
// })(window.parser);
