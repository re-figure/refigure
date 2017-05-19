(function (parser) {

    parser.parseFigures = function () {

        return new Promise(function (resolve, reject) {
            var interval,
                maxIterations = 50,
                iterations = 0;
            interval = setInterval(function () {
                var image = document.querySelector('div.fs-display.fs-image-display img');
                if (image) {
                    var figures = [];
                    var figure = {
                        Authors: parser.getAuthors()
                    };
                    var doi, caption, legend;

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

                    figure.URL = image.getAttribute('src');
                    figures.push(figure);

                    clearInterval(interval);
                    resolve(figures);
                } else if (iterations >= maxIterations) {
                    clearInterval(interval);
                    reject('Maximum iteration counter exceeded. Website is too slow!');
                }
                iterations++;
            }, 200);
        });

    };

})(window.parser);
