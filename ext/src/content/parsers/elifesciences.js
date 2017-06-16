(function (parser) {
    parser.CONTENT_BLOCK_SELECTOR = '.article-section__body';

    parser.parseFigures = function () {
        var pageDOI = parser.getPageDOI(),
            Authors = parser.getAuthors(),
            figures = [];

        Sizzle(parser.CONTENT_BLOCK_SELECTOR + ' .asset-viewer-inline--figure').forEach(function (figure) {
            var figureLink = Sizzle('figure a img', figure);
            if (figureLink.length !== 1) {
                window.logError('Figure has ', figureLink.length, 'images');
            } else {
                var Legend = Sizzle('.caption-text__body p', figure);
                if (Legend.length) {
                    Legend = Legend[0].innerText.replace('see more', '');
                } else {
                    Legend = '';
                }
                figures.push({
                    URL: figureLink[0].src,
                    Caption: getFigureCaption(figure),
                    Legend: Legend,
                    Authors: Authors,
                    DOI: pageDOI,
                    DOIFigure: getFigureDOI(figure)
                });
            }
        });

        return Promise.resolve(figures);

        /////////////////////////////

        function getFigureDOI(container) {
            var selector = Sizzle('.doi--asset a', container);
            return selector.length ? selector[0].innerText.replace('http://doi.org/', '') : '';
        }

        function getFigureCaption(container) {
            var selector = Sizzle('h6', container);
            return parser.prepareContent(selector[0]);
        }
    };

})(window.parser);
