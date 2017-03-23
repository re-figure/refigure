var CONTENT_BLOCK_SELECTOR = 'body',
    FIGURES = [];
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    switch (request.type) {
        case _gConst.MSG_TYPE_ADD_START:
            figureAddStart();
            break;
        case _gConst.MSG_TYPE_START_SEARCH:
            setTimeout(searchFigures(), 1);
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

function figureAddStart() {
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
    var figures = [];
    for (var i = 0; i < document.images.length; i++) {
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
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function (e) {
        if (xhr.readyState === 4) {
            var count = 0;
            var foundFigures = [];
            if (xhr.status === 200) {
                var json = JSON.parse(xhr.responseText);
                if (json.error) {
                    console.log('Failed to send search request, got response ', json);
                } else {
                    if (json.data && json.data.figures && Array.isArray(json.data.figures)) {
                        count = json.data.figures.length;
                        foundFigures = json.data.figures;
                    } else {
                        console.log('Got broken response', json);
                        count = -1;
                    }
                }
            } else {
                console.log('Failed to send search request, got status ', xhr.status);
                count = -1;
            }
            chrome.runtime.sendMessage({
                type: _gConst.MSG_TYPE_CHECK_COMPLETED,
                count: count,
                figures: foundFigures
            });
            chrome.storage.local.set({
                foundFigures: foundFigures
            });
        }
    };

    var filteredFigures = figures.map(function (el) {
        return {
            URL: el.URL,
            DOIFigure: el.DOIFigure
        }
    });
    xhr.open("POST", _gApiURL + 'check-figures', true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify({figures: filteredFigures}));
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
    var img = FIGURES.find(function (el) {
        return el.URL === src;
    });
    if (!img) {
        alert(_gConst.POPUP_ERROR_FIG_NOT_PARSED);
    } else {
        chrome.storage.local.get('rfSelected', function (data) {
            var selected = data.rfSelected || [];
            var isDup = selected.find(function (el) {
                return el.URL === src;
            });
            if (isDup) {
                alert(_gConst.POPUP_ERROR_FIG_DUPLICATE);
            } else {
                selected.push(img);
                chrome.storage.local.set({
                    rfSelected: selected
                });
                chrome.runtime.sendMessage({
                    type: _gConst.MSG_TYPE_ADD_COMPLETED,
                    src: src
                });
                window.figurePopup.show();
            }
        });
    }
}

window.figurePopup = {
    element: null,
    show: function () {
        if(!window.figurePopup.element){
            window.figurePopup.create();
        }
        window.figurePopup.element.classList.add('rf-popup-show');
    },
    hide: function () {
        window.figurePopup.element.classList.remove('rf-popup-show');
    },
    create: function () {
        if(window.figurePopup.element){
            return false;
        }
        window.figurePopup.element = document.createElement('div');
        window.figurePopup.element.className = 'rf-popup';
        window.figurePopup.element.innerHTML = [
            '<div class="rf-popup-header">Add figure to collection</div>',
            '<div class="rf-popup-wrp">',
            'Some Content',
            '<button class="rf-popup-btn">Submit</button>',
            '</div>'
        ].join('');
        document.body.appendChild(window.figurePopup.element);
        return true;
    }
};