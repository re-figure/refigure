(function (parser) {
    parser.CONTENT_BLOCK_SELECTOR = '.jig-ncbiinpagenav';

    parser.parseFigures = function () {
        var figures = [];
        //noinspection UnnecessaryLocalVariableJS
        var Authors = parser.getAuthors();
        var pageDOI = parser.getPageDOI();
        var src, figureBlock, caption, legend;

        for (var i = 0; i < document.images.length; i++) {
            src = document.images[i].src;
            //src = document.images[i].getAttribute("src-large");
            if (src && src.match(/articles\//) /* && document.images[i].hasAttribute('src-large')*/) {
                var figure = {URL: src};

                figureBlock = document.images[i].parentNode.parentNode;

                caption = figureBlock.querySelector('div.icnblk_cntnt > div:nth-child(1) > a');
                caption = caption ? caption.innerText : null;
                legend = figureBlock.querySelector('div.icnblk_cntnt > div:nth-child(2) > span');
                legend = legend ? legend.innerText : null;

                if (caption) {
                    figure.Caption = caption;
                }
                if (legend) {
                    figure.Legend = legend;
                }
                figure.Authors = Authors;
                figure.DOI = pageDOI;
                figures.push(figure);
            }
        }

        return Promise.resolve(figures);
    };

})(window.parser);
