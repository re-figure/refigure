const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const bodyParser = require('body-parser');
const config = require('js.shared').config;

const p = require('../package.json');
config.init(p.locals);

// various middleware parsers
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cookieParser());

// routes
app.use(require('./routes'));

// Start server
const srvPort = config.get('server.port', '8181');
app.listen(srvPort, function () {
    console.log('Server has started at %s', srvPort);
});
