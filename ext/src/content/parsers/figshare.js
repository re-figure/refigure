(function (parser) {

    var oldSrcTransformer = parser.srcTransformer;

    parser.parseFigures = function () {
        if (window.location.pathname.indexOf('/collections') === 0) {
            return collectionParser();
        } else {
            return commonParser();
        }
    };

    function collectionParser() {
        console.log('collectionParser');
        parser.srcTransformer = function (src) {
            var imageID = src.replace(/^.*\/(\d+)\/thumb\.png$/, '$1');
            return 'https://ndownloader.figshare.com/files/' + imageID + '/preview/' + imageID + '/preview.jpg';
        };

        return new Promise(function (resolve, reject) {
            var interval,
                maxIterations = 20,
                iterations = 0;
            interval = setInterval(function () {
                var elements = Sizzle('.listing-wrap .portal-item-thumb-wrap');
                if (elements.length) {
                    var figures = [],
                        pageDOI = document.querySelector('meta[name="DC.identifier"]').content.replace(/doi:/, '');

                    elements.forEach(function (block) {
                        figures.push({
                            URL: parser.srcTransformer(Sizzle('img', block)[0].src),
                            Caption: Sizzle('.item-title', block)[0].innerText,
                            Authors: getAuthors(block),
                            DOI: pageDOI
                        });
                    });
                    clearInterval(interval);
                    resolve(figures);
                } else if (iterations >= maxIterations) {
                    clearInterval(interval);
                    reject('Maximum iteration counter exceeded. Website is too slow!');
                }
                iterations++;
            }, 200);
        });

        function getAuthors (block) {
            return Sizzle('.authors-trigger', block).map(function (authorBlock) {
                return authorBlock.innerHTML;
            }).join('; ');
        }
    }

    function commonParser() {
        parser.srcTransformer = oldSrcTransformer;
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
    }

})(window.parser);
