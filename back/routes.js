'use strict';

const express = require('express');
const router = express.Router();

const auth = require('./auth');
const users = require('./users');
const captcha = require('./captcha');
const figures = require('./figures');
const metapublications = require('./metapublications');

const homePage = __dirname + '/../build/';
const staticOptions = {};

module.exports = router;

// static pages router
router.use(express.static(homePage, staticOptions));

// validation
router.get('/api/service-validate', (req, res) => {
    res.send('OKBOAZMEAL');
});

// captcha
router.get('/api/captcha', captcha.generate);
router.get('/api/captcha-validate/:captcha', captcha.validate);

// authentication and users
router.post('/api/login', auth.login);
router.post('/api/password-validate', auth.passwordValidate);
router.post('/api/register', users.register);
router.post('/api/registration-complete', users.registrationComplete);
router.post('/api/password-change-request', users.passwordChangeRequest);
router.get('/api/password-change/:token', users.passwordChange);
router.post('/api/password-change', users.passwordChange);
router.post('/api/profile-update', users.updateUser);
router.get('/api/userinfo', users.userInfo);

// public API
router.post('/api/check-figures', figures.checkFigures);

router.get('/api/figure/:ID', figures.getFigure);
router.get('/api/metapublication/:ID', metapublications.getMetapublication);
router.get('/api/most-visited-metapublications', metapublications.mostVisited);
router.get('/api/metapublications', metapublications.searchMetapublications);

// content management API available only for logged in users
router.get('/api/my-metapublications', metapublications.myMetapublications);

router.post('/api/metapublication', metapublications.addOrUpdateMetapublication);
router.put('/api/metapublication', metapublications.addOrUpdateMetapublication);
router.put('/api/metapublication-flag', metapublications.flagMetapublication);
router.delete('/api/metapublication/:ID', metapublications.deleteMetapublication);

router.post('/api/figure', figures.addOrUpdateFigure);
router.put('/api/figure', figures.addOrUpdateFigure);
router.delete('/api/figure/:ID', figures.deleteFigure);

router.get('/api/statistics', metapublications.getStatistics);