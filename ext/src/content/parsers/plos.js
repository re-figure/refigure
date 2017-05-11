(function (parser) {
    parser.CONTENT_BLOCK_SELECTOR = '.article-text';

    parser.parseFigures = function () {
        var figures = [],
            pageDOI = parser.getPageDOI(),
            Authors = parser.getAuthors();

        Sizzle(parser.CONTENT_BLOCK_SELECTOR + ' .figure[data-doi]').forEach(function (figure) {
            var DOIFigure = figure.dataset.uri ? figure.dataset.uri.replace(/^info:doi\//, '') : figure.dataset.doi,
                figureImage = Sizzle('.img-box img', figure);
            if (figureImage.length !== 1) {
                window.logError('Figure has ', figureImage.length, 'images');
            } else {
                var Legend = Sizzle('>p:not([class])', figure).map(function (tag) {
                    return parser.prepareContent(tag);
                }).join('');
                figures.push({
                    URL: parser.srcTransformer(figureImage[0].src),
                    Caption: getFigureCaption(figure, figureImage[0].title),
                    Legend: Legend,
                    Authors: Authors,
                    DOI: pageDOI,
                    DOIFigure: DOIFigure
                });
            }
        });

        return Promise.resolve(figures);

        /////////////////////////////

        function getFigureCaption(container, title) {
            var selector = Sizzle('.figcaption', container);
            return selector.length ? parser.prepareContent(selector[0]) : title;
        }
    };

    parser.srcTransformer = function (src) {
        return src.replace('info:doi/', '');
    };

})(window.parser);
