const express = require('express');
const router = express.Router();
const config = require('js.shared').config;

const homePage = __dirname + '/../build/';
const staticOptions = {};

module.exports = router;

// Static pages Router
router.use(express.static(homePage, staticOptions));
