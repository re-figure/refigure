(function (parser) {
    parser.CONTENT_BLOCK_SELECTOR = '.fig-expansion';

    parser.parseFigures = function () {
        var pageDOI = parser.getPageDOI(),
            Authors = parser.getAuthors(),
            figures = [];
        Sizzle(parser.CONTENT_BLOCK_SELECTOR).forEach(function (figure) {
            var figureLink = Sizzle('.fig-inline-img img', figure);
            if (figureLink.length !== 1) {
                window.logError('Figure has ', figureLink.length, 'images');
            } else {
                var Legend = Sizzle('.fig-caption > p:not(:last)', figure).map(function (tag) {
                    return parser.prepareContent(tag);
                }).join('');
                figures.push({
                    URL: figureLink[0].src,
                    Caption: getFigureCaption(figure, figureLink[0].alt),
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
            var selector = Sizzle('.fig-caption > p:last a', container);
            return selector.length ? selector[0].innerText.replace('http://dx.doi.org/', '') : '';
        }

        function getFigureCaption(container, title) {
            var selector = Sizzle('.caption-title', container);
            return selector.length ? parser.prepareContent(selector[0]) : title;
        }
    };

})(window.parser);
