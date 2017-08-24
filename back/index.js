'use strict';

const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const bodyParser = require('body-parser');
const config = require('js.shared').config;

// initialize config from package.json
const p = require('../package.json');
config.init(p.locals);

let awsConfig = config.get('aws.config');
if (awsConfig) {
    require('./aws/init')({
        profile: config.get('aws.profile', 'default'),
        region: config.get('aws.region', 'us-east-1')
    });
    require('./aws/ssm').getConfiguration(awsConfig)
        .then((data) => {
            // initialize config from aws parameters store
            config.init(data);
            main();
        })
        .catch((err) => {
            console.log('Cannot read AWS parameters', err);
        });
} else {
    main();
}

/////////////////////

function main() {
    const routes = require('./routes');
    const auth = require('./auth');
    const errors = require('./errors');

    let ssl = config.getT('server.ssl', 'b', true);
    if (ssl) {
        const httpsRedirect = require('express-https-redirect');
        app.use('/', httpsRedirect());
    }

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

}
