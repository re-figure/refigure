CONTENT_BLOCK_SELECTOR = 'collections-item';

function parseFigures() {
    return new Promise(function (resolve, reject) {
        window.addEventListener('message', function (event) {
            var images = [];
            if (event.data && event.data.images) {
                images = event.data.images.map(function (img) {
                    return {
                        Authors: img.Authors,
                        Caption: img.Caption,
                        DOI: img.DOI,
                        DOIFigure: img.DOIFigure,
                        Legend: img.Legend,
                        URL: img.URL,
                        Features: img.Features
                    };
                });
            }
            resolve(images);
        }, false);
    });
}
