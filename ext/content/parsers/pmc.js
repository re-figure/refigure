CONTENT_BLOCK_SELECTOR = '.jig-ncbiinpagenav';

function parseFigures() {
    var figures = [];
    //noinspection UnnecessaryLocalVariableJS
    var dfd = new Promise(function (resolve) {
        var authors = document.querySelector("meta[name='citation_authors']");
        var doi = document.querySelector("meta[name='citation_doi']");
        var src, prnt, caption, legend;

        if (authors && authors.content) {authors = authors.content.replace(/,/g, ";");}
        if (doi && doi.content) {doi = doi.content;}

        for (var i = 0; i < document.images.length; i++) {
            src = document.images[i].src;
            var hasLarge = document.images[i].getAttribute("src-large");
            if (hasLarge && src && src.match(/articles\/.*\/bin/)) {
                var figure = {URL: src};

                prnt = document.images[i].parentNode.parentNode;
                caption = prnt.childNodes[1].childNodes[0];
                legend = prnt.getElementsByTagName('span')[0];

                if (caption) {figure.Caption = caption.innerText;}
                if (legend) {figure.Legend = legend.innerText;}
                if (authors) {figure.Authors = authors;}
                if (doi) {figure.DOI = doi;}
                figures.push(figure);
            }
        }
        resolve(figures);
    });

    return dfd;
}