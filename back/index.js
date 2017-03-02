let express = require('express');
let cookieParser = require('cookie-parser');
let app = express();
let bodyParser = require('body-parser');
let config = require('js.shared').config;

let p = require('../package.json');
config.init(p.locals);

// various middleware parsers
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cookieParser());

// routes
app.use(require('./routes'));

// Start server
var srvPort = config.get('server.port', '8181');
app.listen(srvPort, function () {
    console.log('Server has started at %s', srvPort);
});
