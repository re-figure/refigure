let express = require('express');
let router = express.Router();
let config = require('js.shared').config;

let homePage = __dirname + '/../build/';
let staticOptions = {};

module.exports = router;

// Static pages Router
router.use(express.static(homePage, staticOptions));
