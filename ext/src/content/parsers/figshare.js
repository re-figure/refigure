(function (parser) {

    parser.parseFigures = function () {
        var figures = [];
        var figure = {
            Authors: parser.getAuthors()
        };
        var doi, caption, legend;

        var dfd = new Promise(function (resolve, reject) {
            setTimeout(function () {
                var image = document.querySelector('div.fs-display.fs-image-display img');
                if (image) {
                    figure.URL = image.getAttribute('src');
                    resolve(figures);
                } else {
                    reject('Unable to get figure image');
                }
            }, 200);
        });

        doi = document.querySelector('meta[name="DC.identifier"]');
        caption = document.querySelector('div.item-wrap div.item-left h2.title');
        legend = document.querySelector('div.item-wrap div.item-left > div.description.section');

        if (doi && doi.content) {
            figure.DOIFigure = doi.content.replace(/doi:/, '');
        }
        if (caption) {
            figure.Caption = caption.innerText;
        }
        if (legend) {
            figure.Legend = legend.innerText;
        }

        figures.push(figure);
        return dfd;
    };

})(window.parser);
