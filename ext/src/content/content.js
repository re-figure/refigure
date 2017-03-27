var CONTENT_BLOCK_SELECTOR = 'body',
    FIGURES = [],
    METAPUBLICATION_ID = null;
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    switch (request.type) {
        case _gConst.MSG_TYPE_ADD_START:
            figureAddStart(request.metapublicationId);
            break;
        case _gConst.MSG_TYPE_START_SEARCH:
            setTimeout(searchFigures(), 1);
            break;
        case _gConst.MSG_TYPE_CREATE_IN_POPUP:
            window.figurePopup.hide();
            break;
    }
});

function onClickImage(event) {
    event.stopPropagation();
    event.preventDefault();
    figureAddStop();
    addToSelected(event.target.src);
    return false;
}

function figureAddStart(metapublicationId) {
    METAPUBLICATION_ID = metapublicationId;
    Sizzle(CONTENT_BLOCK_SELECTOR + ' img').forEach(function (el) {
        el.classList.add('rf-addable-image');
        el.addEventListener('click', onClickImage);
    });
}

function figureAddStop() {
    Sizzle(CONTENT_BLOCK_SELECTOR + ' img').forEach(function (el) {
        el.classList.remove('rf-addable-image');
        el.removeEventListener('click', onClickImage);
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
            if (figures[i].DOIFigure && deduped[j].DOIFigure && figures[i].DOIFigure.toLowerCase() === deduped[j].DOIFigure.toLowerCase()) {
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


function parseFigures() {
    let figures = [];
    for (let i = 0; i < document.images.length; i++) {
        figures.push({URL: document.images[i].src});
    }
    return Promise.resolve(figures);
}

function searchFigures() {
    parseFigures().then(function (result) {
        FIGURES = dedupFigures(result);
        console.log('FIGURES found', FIGURES);
        if (FIGURES.length > 0) {
            chrome.runtime.sendMessage({
                type: _gConst.MSG_TYPE_SEARCH_COMPLETED,
                figures: FIGURES,
                count: FIGURES.length
            });
            sendCheckFiguresRequest(FIGURES);
        }
    }, function (error) {
        console.error(error);
    });
}

function sendCheckFiguresRequest(figures) {
    let filteredFigures = figures.map(function (el) {
        return {
            URL: el.URL,
            DOIFigure: el.DOIFigure
        }
    });

    sendRequest({
        type: 'POST',
        url: 'check-figures',
        data: {
            figures: filteredFigures
        }
    }).then((data) => {
        chrome.runtime.sendMessage({
            type: _gConst.MSG_TYPE_CHECK_COMPLETED,
            figures: data.figures
        });
        chrome.storage.local.set({
            foundFigures: data.figures
        });
    });
}

function logError() {
    let args = Array.prototype.slice.call(arguments);
    args.unshift('ReFigure:');
    console.error.apply(null, args);
}

/**
 * Strips all tags except images,
 * Transforms relative image src to absolute
 * @param {HTMLElement} node content of tag to parse
 * @return {string} transformed html text
 */
function prepareContent(node) {
    let tmpEl = document.createElement('div');
    //replace image tags to save them after "innerHTML"
    let tmpContent = node.innerHTML.replace(/<img/g, '||img||');
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
}

function addToSelected(src) {
    let img = FIGURES.find(function (el) {
        return el.URL === src;
    });
    if (!img) {
        alert(_gConst.POPUP_ERROR_FIG_NOT_PARSED);
    } else {
        chrome.storage.local.get('rfSelected', function (data) {
            let selected = data.rfSelected || [];
            let isDup = selected.find(function (el) {
                return el.URL === src;
            });
            if (isDup) {
                alert(_gConst.POPUP_ERROR_FIG_DUPLICATE);
            } else {
                window.figurePopup.show(img);
            }
        });
    }
}

function sendRequest(params) {
    let requestParams = Object.assign({
        url: '',
        type: 'GET',
        data: {},
        headers: {}
    }, params);

    return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    let json = JSON.parse(xhr.responseText);
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
        xhr.setRequestHeader("Content-Type", "application/json");

        Object.keys(requestParams.headers).forEach((key) => {
            xhr.setRequestHeader(key, requestParams.headers[key]);
        });
        xhr.send(JSON.stringify(requestParams.data));
    });
}

window.figurePopup = {
    _getCollections: () => {
        return new Promise((resolve, reject) => {
            chrome.storage.local.get('userInfo', (data) => {
                if (data.userInfo) {
                    sendRequest({
                        url: 'my-metapublications',
                        headers: {
                            Authentication: data.userInfo.Token
                        }
                    }).then((data) => {
                        resolve(data.results);
                    });
                } else {
                    reject(_gConst.ERROR_NOT_LOGGED);
                }
            });
        });
    },
    _element: null,
    _fillForm: (data, collections) => {
        let inputs = window.figurePopup._element.getElementsByClassName('form-control');
        let optionsHtml = [];
        if(METAPUBLICATION_ID){
            data.MetapublicationID = METAPUBLICATION_ID;
        }
        collections.forEach((el) => {
            optionsHtml.push(
                '<option value="' + el.Metapublication.ID + '">' +
                    el.Metapublication.Title + ' (' + el.Metapublication.FiguresCount + ')' +
                '</option>'
            );
        });
        for (let index = 0; index < inputs.length; index++) {
            if (inputs[index].name === 'MetapublicationID') {
                inputs[index].innerHTML = optionsHtml.join('');
            }
            inputs[index].value = data[inputs[index].name] || '';
        }
    },
    show: (data) => {
        !window.figurePopup._element && window.figurePopup.create();

        window.figurePopup._getCollections().then(
            (collections) => {
                window.figurePopup._fillForm(data, collections);
                window.figurePopup._element.classList.add('rf-popup-show');
                window.figurePopup.onChange();
            }, (text) => {
                alert(text);
            }
        );
    },
    hide: () => {
        window.figurePopup._element && window.figurePopup._element.classList.remove('rf-popup-show');
    },
    onChange: () => {
        let formData = {};
        let inputs = window.figurePopup._element.getElementsByClassName('form-control');
        for (let index = 0; index < inputs.length; index++) {
            formData[inputs[index].name] = inputs[index].value;
        }
        chrome.storage.local.set({
            rfAddFigure: formData
        });
    },
    onSubmit: (event) => {
        chrome.storage.local.get('userInfo', (data) => {
            if (data.userInfo) {
                let formData = {};
                let inputs = window.figurePopup._element.getElementsByClassName('form-control');
                for (let index = 0; index < inputs.length; index++) {
                    formData[inputs[index].name] = inputs[index].value;
                }
                sendRequest({
                    type: 'POST',
                    url: 'figure',
                    data: formData,
                    headers: {
                        Authentication: data.userInfo.Token
                    }
                }).then((data) => {
                    console.log('data', data);
                    alert(_gConst.FIGURE_ADDED);
                    window.figurePopup.hide();
                    chrome.storage.local.remove('rfAddFigure');
                }, (data) => {
                    console.log(data);
                });
            } else {
                alert(_gConst.ERROR_NOT_LOGGED);
            }
        });

        event.preventDefault();
        return false;
    },
    create: () => {
        if (window.figurePopup._element) {
            return false;
        }
        window.figurePopup._element = document.createElement('div');
        window.figurePopup._element.className = 'rf-popup';
        window.figurePopup._element.innerHTML = [
            '<form id="rf-add-figure-form" name="addFigureForm" class="panel panel-primary">',
                '<div class="panel-heading text-center">Add figure to collection</div>',
                '<div class="panel-body">',
                    '<div class="form-group">',
                        '<label class="control-label" for="rf-input-url">Figure URL</label>',
                        '<input class="form-control" name="URL" id="rf-input-url" type="text" placeholder="URL" readonly>',
                    '</div>',

                    '<div class="form-group">',
                        '<label class="control-label" for="rf-input-metapublication">Metapublication</label>',
                        '<select class="form-control" name="MetapublicationID" id="rf-input-metapublication"></select>',
                    '</div>',

                    '<div class="form-group">',
                        '<label class="control-label" for="rf-input-fig-doi">Figure DOI</label>',
                        '<input class="form-control" name="FigureDOI" id="rf-input-fig-doi" type="text" placeholder="FigureDOI">',
                    '</div>',

                    '<div class="form-group">',
                        '<label class="control-label" for="rf-input-caption">Caption</label>',
                        '<input class="form-control" name="Caption" id="rf-input-caption" type="text" placeholder="Caption">',
                    '</div>',

                    '<div class="form-group">',
                        '<label class="control-label" for="rf-input-legend">Legend</label>',
                        '<textarea class="form-control" rows="5" name="Legend" id="rf-input-legend" placeholder="Legend"></textarea>',
                    '</div>',

                    '<div class="form-group">',
                        '<label class="control-label" for="rf-input-article-doi">Article DOI</label>',
                        '<input class="form-control" name="DOI" id="rf-input-article-doi" type="text" placeholder="Article DOI">',
                    '</div>',

                    '<div class="form-group">',
                        '<label class="control-label" for="rf-input-article-authors">Article authors</label>',
                        '<textarea class="form-control" rows="5" name="Authors" id="rf-input-article-authors" placeholder="Authors"></textarea>',
                    '</div>',
                '</div>',
                '<div class="panel-footer">',
                    '<button class="btn btn-block btn-primary">Submit</button>',
                '</div>',
            '</form>',
        ].join('');
        document.body.appendChild(window.figurePopup._element);
        document.getElementById('rf-add-figure-form').addEventListener('submit', window.figurePopup.onSubmit, false);

        return true;
    }
};