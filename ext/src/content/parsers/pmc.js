CONTENT_BLOCK_SELECTOR = '.jig-ncbiinpagenav';

function parseFigures() {
    var figures = [];
    //noinspection UnnecessaryLocalVariableJS
    var authors = document.querySelector("meta[name='citation_authors']");
    var doi = document.querySelector("meta[name='citation_doi']");
    var src, figureBlock, caption, legend;

    if (authors && authors.content) {authors = authors.content.replace(/,/g, ";");}
    if (doi && doi.content) {doi = doi.content;}

    for (var i = 0; i < document.images.length; i++) {
        src = document.images[i].src;
        //src = document.images[i].getAttribute("src-large");
        if (src && src.match(/articles\/.*\/bin/) && document.images[i].hasAttribute("src-large")) {
            var figure = {URL: src};

            figureBlock = document.images[i].parentNode.parentNode;

            caption = figureBlock.querySelector("div.icnblk_cntnt > div:nth-child(1) > a");
            caption = caption ? caption.innerText : null;
            legend = figureBlock.querySelector("div.icnblk_cntnt > div:nth-child(2) > span");
            legend = legend ? legend.innerText : null;

            if (caption) {figure.Caption = caption;}
            if (legend) {figure.Legend = legend;}
            if (authors) {figure.Authors = authors;}
            if (doi) {figure.DOI = doi;}
            figures.push(figure);
        }
    }

    return Promise.resolve(figures);
}