(function (parser) {
    parser.CONTENT_BLOCK_SELECTOR = '.listing-wrap';

    parser.parseFigures = function () {
        return new Promise(function (resolve, reject) {
            var interval,
                maxIterations = 10,
                iterations = 0;
            interval = setInterval(function () {
                var elements = Sizzle(parser.CONTENT_BLOCK_SELECTOR + ' .portal-item-thumb-wrap');
                if (elements.length) {
                    var figures = [],
                        pageDOI = document.querySelector('meta[name="DC.identifier"]').content.replace(/doi:/, '');

                    elements.forEach(function (block) {
                        figures.push({
                            URL: parser.srcTransformer(Sizzle('img', block)[0].src),
                            Caption: Sizzle('.item-title', block)[0].innerText,
                            Authors: parser.getAuthors(block),
                            DOI: pageDOI
                        });
                    });
                    clearInterval(interval);
                    resolve(figures);
                } else if (iterations >= maxIterations) {
                    clearInterval(interval);
                    reject('Maximum iteration counter exceeded. Website is too slow!');
                }
                iterations++;
            }, 300);
        });
    };

    parser.getAuthors = function (block) {
        return Sizzle('.authors-trigger', block).map(function (authorBlock) {
            return authorBlock.innerHTML;
        }).join('; ');
    };

    parser.srcTransformer = function (src) {
        var imageID = src.replace(/^.*\/(\d+)\/thumb\.png$/, '$1');
        return 'https://ndownloader.figshare.com/files/' + imageID + '/preview/' + imageID + '/preview.jpg';
    };

})(window.parser);
