'use strict';

const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const bodyParser = require('body-parser');

const config = require('js.shared').config;
// initialize config from package.json
const p = require('../package.json');
config.init(p.locals);

const routes = require('./routes');
const auth = require('./auth');
const errors = require('./errors');


// various middleware parsers
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());
app.use(cookieParser());

// authentication filter
app.use(auth.authFilter);

// routes
app.use(routes);
// any other routes:
if (config.get('server.html5-support', true)) {
    const homePage = __dirname + '/../build/';
    app.all('/*', (req, res, next) => {
        res.sendFile('index.html', {
            root: homePage
        });
    });
}

// error handling
app.use(errors);

// start the server
let port = config.get('server.port', '8181');
app.listen(port, () => {
    console.log('Server has started at %s', port);
});
