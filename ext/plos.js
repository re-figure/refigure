
function parseFigures() {
    var figures = [];
    for (var i = 0; i < document.images.length; i++) {
        var src = document.images[i].src;
        if (src.match(/article\/figure\/image/)) {
            var figure = {URL: src};
            var p = src.match(/id=(10.*$)/);
            if (p) {
                figure.DOIFigure = p[1];
            } else {
                p = src.match(/id=info:doi\/(10.*$)/);
                if (p) {
                    figure.DOIFigure = p[1];
                }
            }
            figures.push(figure);
        }
    }
    return figures;
}