function parseFigures() {
    var figures = [];
    var authorMetas = document.querySelectorAll("meta[name='citation_author']");
    var doi, caption, legend, authors = [], figure = {};

    var dfd = new Promise(function (resolve, reject) {
        setTimeout(function () {
            var image = document.querySelector('div.fs-display.fs-image-display img');
            if (image) {
                figure.URL = image.getAttribute('src');
                resolve(figures);
            } else {
                reject("Unable to get figure image");
            }
        }, 200);
    });

    for (var j = 0; j < authorMetas.length; j++ ) {
        authors.push(authorMetas.item(j).content.replace(/,/, ""));
    }

    doi = document.querySelector("meta[name='DC.identifier']");
    caption = document.querySelector("div.item-wrap div.item-left h2.title");
    legend = document.querySelector("div.item-wrap div.item-left > div.description.section");

    if (authors.length > 0) {figure.Authors = authors.join("; ");}
    if (doi && doi.content) {figure.DOI = doi.content.replace(/doi:/, "");}
    if (caption) {figure.Caption = caption.innerText;}
    if (legend) {figure.Legend = legend.innerText;}
    // if (legend) {figure.Legend = legend.innerText.replace(/\n/ig, ' ');}

    figures.push(figure);
    return dfd;
}
