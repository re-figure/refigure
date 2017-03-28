var CONTENT_BLOCK_SELECTOR = 'body';

var refigure = {
    METAPUBLICATION_ID : null,
    figures: [],
    foundFigures: []
};

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
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
        case _gConst.MSG_TYPE_ADD_FIGURE_TO_COLLECTION:
            addToSelected(request.src);
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
    refigure.METAPUBLICATION_ID = metapublicationId;
    Sizzle(CONTENT_BLOCK_SELECTOR + ' img').forEach(function(el) {
        el.classList.add('rf-addable-image');
        el.addEventListener('click', onClickImage);
    });
}

function figureAddStop() {
    Sizzle(CONTENT_BLOCK_SELECTOR + ' img').forEach(function(el) {
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
    var figures = [];
    for (var i = 0; i < document.images.length; i++) {
        figures.push({URL: document.images[i].src});
    }
    return Promise.resolve(figures);
}

function parsingCompleted(figures) {
    console.log('Parsed out from the current page the following figures: ', figures);
    refigure.figures = figures;
    chrome.runtime.sendMessage({
        type: _gConst.MSG_TYPE_SEARCH_COMPLETED,
        figures: figures
    });
}

function searchCompleted(figures) {
    console.log('Found on the current page the following figures: ', figures);
    refigure.foundFigures = figures;
    chrome.runtime.sendMessage({
        type: _gConst.MSG_TYPE_CHECK_COMPLETED,
        figures: figures
    });
}

function searchFigures() {
    parseFigures().then(
        function(result) {
            var figures = dedupFigures(result);
            parsingCompleted(figures);
            if (figures.length > 0) {
                sendCheckFiguresRequest(figures);
            } else {
                searchCompleted([]);
            }
        },
        function(error) {
            console.error(error);
            searchCompleted([]);
        }
    );
}

function sendCheckFiguresRequest(figures) {
    var filteredFigures = figures.map(function(el) {
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
    }).then(
        function(data) {
            searchCompleted(data.figures);
        },
        function(error) {
            console.log(error);
            searchCompleted([]);
        }
    );
}

function logError() {
    var args = Array.prototype.slice.call(arguments);
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
    var tmpEl = document.createElement('div');
    //replace image tags to save them after "innerHTML"
    var tmpContent = node.innerHTML.replace(/<img/g, '||img||');
    //convert relative image srcs to absolute
    tmpContent = tmpContent.replace(/src="(?!http)(.*?)"/g, function(match, src) {
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
    // check if the selected figure exists in the site-specific figures parsed out from the current page
    var img = refigure.figures.find(function(el) {
        return el.URL === src;
    });
    if (!img) {
        // if figure was not parsed out then just use image src
        img = {
            URL: src
        };
    }
    window.figurePopup.show(img);
}

function sendRequest(params) {
    var requestParams = Object.assign({
        url: '',
        type: 'GET',
        data: {},
        headers: {}
    }, params);

    return new Promise(function(resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
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
        xhr.setRequestHeader("Content-Type", "application/json");

        Object.keys(requestParams.headers).forEach(function(key) {
            xhr.setRequestHeader(key, requestParams.headers[key]);
        });
        xhr.send(JSON.stringify(requestParams.data));
    });
}

window.figurePopup = {
    _getCollections: function() {
        return new Promise(function(resolve, reject) {
            chrome.storage.local.get('userInfo', function(data) {
                if (data.userInfo) {
                    sendRequest({
                        url: 'my-metapublications',
                        headers: {
                            Authentication: data.userInfo.Token
                        }
                    }).then(function(data) {
                        resolve(data.results);
                    });
                } else {
                    reject(_gConst.ERROR_NOT_LOGGED);
                }
            });
        });
    },
    _element: null,
    _fillForm: function(data, collections) {
        var inputs = window.figurePopup._element.getElementsByClassName('form-control');
        var optionsHtml = [];
        if (refigure.METAPUBLICATION_ID) {
            data.MetapublicationID = refigure.METAPUBLICATION_ID;
        }
        collections.forEach(function(el) {
            optionsHtml.push(
                '<option value="' + el.Metapublication.ID + '">' +
                    el.Metapublication.Title + ' (' + el.Metapublication.FiguresCount + ')' +
                '</option>'
            );
        });
        for (var index = 0; index < inputs.length; index++) {
            if (inputs[index].name === 'MetapublicationID') {
                inputs[index].innerHTML = optionsHtml.join('');
            }
            inputs[index].value = data[inputs[index].name] || '';
        }
    },
    show: function(data) {
        !window.figurePopup._element && window.figurePopup.create();
        // TODO check if the figure exists in the current collection
        // if so, then use UPDATE then not CREATE
        window.figurePopup._getCollections().then(
            function(collections) {
                window.figurePopup._fillForm(data, collections);
                window.figurePopup._element.classList.add('rf-popup-show');
                window.figurePopup.onChange();
            }, function(text) {
                alert(text);
            }
        );
    },
    hide: function() {
        window.figurePopup._element && window.figurePopup._element.classList.remove('rf-popup-show');
    },
    onCancel: function() {
        window.figurePopup.hide();
        chrome.storage.local.remove('rfAddFigure');
    },
    onChange: function() {
        var formData = {};
        var inputs = window.figurePopup._element.getElementsByClassName('form-control');
        for (var index = 0; index < inputs.length; index++) {
            formData[inputs[index].name] = inputs[index].value;
        }
        chrome.storage.local.set({
            rfAddFigure: formData
        });
    },
    onSubmit: function(event) {
        chrome.storage.local.get('userInfo', function(data) {
            if (data.userInfo) {
                var formData = {};
                var inputs = window.figurePopup._element.getElementsByClassName('form-control');
                for (var index = 0; index < inputs.length; index++) {
                    formData[inputs[index].name] = inputs[index].value;
                }
                sendRequest({
                    type: 'POST',
                    url: 'figure',
                    data: formData,
                    headers: {
                        Authentication: data.userInfo.Token
                    }
                }).then(function(data) {
                    console.log('data', data);
                    alert(_gConst.FIGURE_ADDED);
                    window.figurePopup.hide();
                    chrome.storage.local.remove('rfAddFigure');
                }, function(data) {
                    console.log(data);
                });
            } else {
                alert(_gConst.ERROR_NOT_LOGGED);
            }
        });

        event.preventDefault();
        return false;
    },
    create: function() {
        if (window.figurePopup._element) {
            return false;
        }
        window.figurePopup._element = document.createElement('div');
        window.figurePopup._element.className = 'rf-popup';
        window.figurePopup._element.innerHTML = [
            '<form id="rf-add-figure-submit" name="addFigureForm" class="panel panel-primary">',
                '<div class="panel-heading text-center">Add figure to collection</div>',
                '<div class="panel-body">',
                    '<div class="form-group">',
                        '<label class="control-label" for="rf-input-url">Figure URL</label>',
                        '<input class="form-control" name="URL" id="rf-input-url" type="text" placeholder="URL" readonly>',
                    '</div>',

                    '<div class="form-group">',
                        '<label class="control-label" for="rf-input-metapublication">Collection</label>',
                        '<select class="form-control" name="MetapublicationID" id="rf-input-metapublication"></select>',
                    '</div>',

            /*
                    '<div class="form-group">',
                        '<label class="control-label" for="rf-input-fig-doi">Figure DOI</label>',
                        '<input class="form-control" name="FigureDOI" id="rf-input-fig-doi" type="text" placeholder="FigureDOI">',
                    '</div>',
            */
                    '<div class="form-group">',
                        '<label class="control-label" for="rf-input-caption">Caption</label>',
                        '<input class="form-control" name="Caption" id="rf-input-caption" type="text" placeholder="Caption">',
                    '</div>',

                    '<div class="form-group">',
                        '<label class="control-label" for="rf-input-legend">Legend</label>',
                        '<textarea class="form-control" rows="5" name="Legend" id="rf-input-legend" placeholder="Legend"></textarea>',
                    '</div>',

                    '<div class="form-group">',
                        '<label class="control-label" for="rf-input-features">Features</label>',
                        '<textarea class="form-control" rows="5" name="Features" id="rf-input-features" placeholder="Features"></textarea>',
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
                    '<div class="row">',
                        '<div class="col-xs-6"><button type="button" id="rf-add-figure-cancel" class="btn btn-block btn-info">Dismiss</button></div>',
                        '<div class="col-xs-6"><button class="btn btn-block btn-primary">Submit</button></div>',
                    '</div>',
                '</div>',
            '</form>',
        ].join('');
        document.body.appendChild(window.figurePopup._element);
        document.getElementById('rf-add-figure-submit').addEventListener('submit', window.figurePopup.onSubmit, false);
        document.getElementById('rf-add-figure-cancel').addEventListener('click', window.figurePopup.onCancel, false);

        return true;
    }
};