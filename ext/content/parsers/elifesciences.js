CONTENT_BLOCK_SELECTOR = '.fig-expansion';

function parseFigures() {
    var figures = [],
        pageDOI = getPageDOI(),
        Authors = getAuthors();

    Sizzle(CONTENT_BLOCK_SELECTOR).forEach(function (figure) {
        var figureLink = Sizzle('.fig-inline-img img', figure);
        if (figureLink.length !== 1) {
            logError('Figure has ', figureLink.length, 'images');
        } else {
            var Legend = Sizzle('.fig-caption > p:not(:last)', figure).map(function (tag) {
                return prepareContent(tag);
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

    return figures;

    /////////////////////////////

    function getFigureDOI(container) {
        var selector = Sizzle('.fig-caption > p:last a', container);
        return selector.length ? selector[0].innerText.replace('http://dx.doi.org/', '') : '';
    }

    function getFigureCaption(container, title) {
        var selector = Sizzle('.caption-title', container);
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
