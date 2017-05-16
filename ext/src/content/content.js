var refigure = {
    Metapublication: null,
    figures: []
};

var parser = {};

chrome.storage.local.get('Metapublication', function (data) {
    if (data.Metapublication) {
        refigure.Metapublication = data.Metapublication;
    }
});

chrome.runtime.onMessage.addListener(function (request) {
    switch (request.type) {
        case _gConst.MSG_TYPE_REFIGURE_ADD_START:
            window.refigurePopup.show();
            break;
        case _gConst.MSG_TYPE_IMAGE_ADD_START:
            if (!request.Metapublication && !refigure.Metapublication) {
                alert('Please select Refigure to add to');
            } else {
                figureAddStart(request.Metapublication);
            }
            break;
        case _gConst.MSG_TYPE_START_SEARCH:
            setTimeout(searchFigures(), 1);
            break;
        case _gConst.MSG_TYPE_POPUP_OPENED:
            window.imagePopup.hide();
            window.refigurePopup.hide();
            figureAddStop();
            break;
        case _gConst.MSG_TYPE_ADD_FIGURE_TO_COLLECTION:
            if (!refigure.Metapublication) {
                alert('Please select Refigure to add to');
            } else {
                addToSelected(parser.srcTransformer(request.src));
            }
            break;
    }
});

function onClickImage(event) {
    event.stopPropagation();
    event.preventDefault();
    addToSelected(parser.srcTransformer(event.target.src));
    return false;
}

function onEnterImage() {
    document.getElementById('rf-info-message-add').classList.add('rf-info-message-bordered');
}

function onLeaveImage() {
    document.getElementById('rf-info-message-add').classList.remove('rf-info-message-bordered');
}

function figureAddStart(Metapublication) {
    refigure.Metapublication = Metapublication || refigure.Metapublication;
    Sizzle(parser.CONTENT_BLOCK_SELECTOR + ' img').forEach(function (el) {
        el.classList.add('rf-addable-image');
        el.addEventListener('click', onClickImage);
        el.addEventListener('mouseenter', onEnterImage);
        el.addEventListener('mouseleave', onLeaveImage);
    });
    window.imagePopup.show(false, refigure.Metapublication);
}

function figureAddStop() {
    Sizzle(parser.CONTENT_BLOCK_SELECTOR + ' img').forEach(function (el) {
        el.classList.remove('rf-addable-image');
        el.removeEventListener('click', onClickImage);
        el.removeEventListener('mouseenter', onEnterImage);
        el.removeEventListener('mouseleave', onLeaveImage);
    });
}

function dedupFigures(figures) {
    var deduped = [];
    for (var i = 0; i < figures.length; ++i) {
        var found = false;
        for (var j = 0; j < deduped.length; ++j) {
            if (figures[i].URL && figures[i].URL.toLowerCase() === deduped[j].URL.toLowerCase()) {
                found = true;
                break;
            }
            if (figures[i].DOIFigure && deduped[j].DOIFigure && figures[i].DOIFigure.toLowerCase() ===
                deduped[j].DOIFigure.toLowerCase()) {
                found = true;
                break;
            }
        }
        if (!found) {
            deduped.push(figures[i]);
        }
    }
    return deduped;
}

function parsingCompleted(figures) {
    console.info('Parsed out from the current page the following figures: ', figures);
    refigure.figures = figures;
    chrome.runtime.sendMessage({
        type: _gConst.MSG_TYPE_SEARCH_COMPLETED,
        figures: figures
    });
}

function searchCompleted(data) {
    console.info('Found on the current page the following figures: ', data.figures);
    chrome.runtime.sendMessage({
        type: _gConst.MSG_TYPE_CHECK_COMPLETED,
        figures: data.figures,
        inMetapublications: data.metapublications
    });
}

function searchFigures() {
    parser.parseFigures().then(
        function (result) {
            var figures = dedupFigures(result);
            parsingCompleted(figures);
            if (figures.length > 0) {
                sendCheckFiguresRequest(figures);
            } else {
                searchCompleted({});
            }
        },
        function (error) {
            console.error(error);
            searchCompleted({});
        }
    );
}

function sendCheckFiguresRequest(figures) {
    var filteredFigures = figures.map(function (el) {
        return {
            URL: el.URL,
            DOIFigure: el.DOIFigure
        };
    });

    sendRequest({
        type: 'POST',
        url: 'check-figures',
        data: {
            figures: filteredFigures
        }
    }).then(
        function (data) {
            searchCompleted(data);
        },
        function (error) {
            console.error(error);
            searchCompleted({});
        }
    );
}

function logError() {
    var args = Array.prototype.slice.call(arguments);
    args.unshift('ReFigure:');
    console.error.apply(null, args);
}

function addToSelected(src) {
    //check current collection for current image ('edit' functionality)
    var img = refigure.Metapublication.Figures.find(function (el) {
        return el.URL === src;
    });
    if (!img) {
        // check if the selected figure exists in the site-specific figures parsed out from the current page
        img = refigure.figures.find(function (el) {
            return el.URL === src;
        });
        if (!img) {
            // if figure was not parsed out then just use image src
            img = {
                URL: src
            };
        }
    }
    window.imagePopup.show(img, refigure.Metapublication);
}

function sendRequest(params) {
    var requestParams = Object.assign({
        url: '',
        type: 'GET',
        data: {},
        headers: {}
    }, params);

    return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    var json = JSON.parse(xhr.responseText);
                    if (json.error) {
                        console.error('Failed to send search request, got response ', json);
                        reject(json);
                    } else {
                        if (json.data) {
                            resolve(json.data);
                        } else {
                            console.error('Got broken response', json);
                            reject(json);
                        }
                    }
                } else {
                    console.error('Failed to send search request, got status ' + xhr.status, xhr);
                    reject(xhr);
                }
            }
        };
        xhr.open(requestParams.type, _gApiURL + requestParams.url, true);
        xhr.setRequestHeader('Content-Type', 'application/json');

        Object.keys(requestParams.headers).forEach(function (key) {
            xhr.setRequestHeader(key, requestParams.headers[key]);
        });
        xhr.send(JSON.stringify(requestParams.data));
    });
}

parser = {
    CONTENT_BLOCK_SELECTOR: 'body',
    parseFigures: function () {
        var figures = [];
        for (var i = 0; i < document.images.length; i++) {
            figures.push({URL: document.images[i].src});
        }
        return Promise.resolve(figures);
    },
    /**
     * Strips all tags except images,
     * Transforms relative image src to absolute
     * @param {HTMLElement} node content of tag to parse
     * @return {string} transformed html text
     */
    prepareContent: function (node) {
        var tmpEl = document.createElement('div');
        //replace image tags to save them after "innerHTML"
        var tmpContent = node.innerHTML.replace(/<img/g, '||img||');
        //convert relative image srcs to absolute
        tmpContent = tmpContent.replace(/src="(?!http)(.*?)"/g, function (match, src) {
            tmpEl.innerHTML = '<a href="' + src + '">x</a>';
            return 'src="' + tmpEl.firstChild.href + '"';
        });
        //TODO: convert href and save "a" tags
        //TODO: replace a.ref-tip with span[title="..."] (parse fragment links)
        //strip all tags
        tmpEl.innerHTML = tmpContent;
        tmpContent = tmpEl.innerText;
        //replace images back
        return tmpContent.replace(/\|\|img\|\|/g, '<img');
    },
    getAuthors: function () {
        var authorMeta = Sizzle('meta[name="citation_author"]');
        if (!authorMeta.length) {
            authorMeta = Sizzle('meta[name="DC.contributor"]');
        }
        return authorMeta.map(function (el) {
            return el.content.replace(/,/, '');
        }).join('; ');
    },
    getPageDOI: function () {
        var metaDOI = Sizzle('meta[name="citation_doi"]'),
            ret = '';
        if (metaDOI.length !== 1) {
            window.logError('citation_doi meta length is ', metaDOI.length);
        } else {
            ret = metaDOI[0].content;
        }
        return ret;
    },
    srcTransformer: function (src) {
        return src;
    }
};

window.imagePopup = {};
window.refigurePopup = {};
