CONTENT_BLOCK_SELECTOR = '.article-text';

function parseFigures() {
    var figures = [],
        pageDOI = getPageDOI(),
        Authors = getAuthors();

    Sizzle(CONTENT_BLOCK_SELECTOR + ' .figure[data-doi]').forEach(function (figure) {
        var DOIFigure = figure.dataset.uri ? figure.dataset.uri.replace(/^info:doi\//, '') : figure.dataset.doi,
            figureImage = Sizzle('.img-box img', figure);
        if (figureImage.length !== 1) {
            logError('Figure has ', figureImage.length, 'images');
        } else {
            var Legend = Sizzle('>p:not([class])', figure).map(function (tag) {
                return prepareContent(tag);
            }).join('');
            figures.push({
                URL: figureImage[0].src.replace('size=inline', 'size=large'),   //collecting only large images
                Caption: getFigureCaption(figure, figureImage[0].title),
                Legend: Legend,
                Authors: Authors,
                DOI: pageDOI,
                DOIFigure: DOIFigure
            });
        }
    });

    return figures;

    /////////////////////////////

    function getFigureCaption(container, title) {
        var selector = Sizzle('.figcaption', container);
        return selector.length ? prepareContent(selector[0]) : title;
    }

    function getAuthors() {
        var authorMeta = Sizzle('meta[name="citation_author"]');
        if(!authorMeta.length){
            authorMeta = Sizzle('meta[name="DC.contributor"]');
        }
        return authorMeta.map(function (el) {
            return el.content;
        }).join('; ');
    }

    function getPageDOI() {
        var metaDOI = Sizzle('meta[name="citation_doi"]'),
            ret = '';
        if (metaDOI.length !== 1) {
            logError('citation_doi meta length is ', metaDOI.length);
        } else {
            ret = metaDOI[0].content;
        }
        return ret;
    }

}
