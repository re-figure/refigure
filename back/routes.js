'use strict';

const express = require('express');
const router = express.Router();

const auth = require('./auth');
const oauth = require('./oauth');
const users = require('./users');
const captcha = require('./captcha');
const figures = require('./figures');
const metapublications = require('./metapublications');
const blog = require('./blog');
const downloads = require('./downloads');

const homePage = __dirname + '/../build/';
const staticOptions = {};

module.exports = router;

//routes for social parsers
router.use(metapublications.handleParsers);

// static pages router
router.use(express.static(homePage, staticOptions));

// validation
router.get('/api/service-validate', (req, res) => {
    res.send('OKBOAZMEAL');
});

// captcha
router.get('/api/captcha', captcha.generate);
router.get('/api/captcha-validate/:captcha', captcha.validate);

//OAUTH
router.get('/api/oauth/google/:token', oauth.google);
router.get('/api/oauth/fb/:token', oauth.fb);

// authentication and users
router.post('/api/login', auth.login);
router.post('/api/password-validate', auth.passwordValidate);
router.post('/api/register', users.register);
router.post('/api/registration-complete', users.registrationComplete);
router.post('/api/password-change-request', users.passwordChangeRequest);
router.get('/api/password-change/:token', users.passwordChange);
router.post('/api/password-change', users.passwordChange);
router.post('/api/profile-update', users.updateProfile);
router.get('/api/userinfo', users.userInfo);
// user management
router.get('/api/users', users.searchUsers);
router.get('/api/user/:ID', users.getUser);
router.delete('/api/user/:ID', users.deleteUser);
router.put('/api/user', users.updateUser);

// public API
router.post('/api/check-figures', figures.checkFigures);
router.post('/api/check-figures-v2', figures.checkFiguresV2);

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

router.get('/api/blog/:ID', blog.getSingle);
router.get('/api/blog', blog.getAll);
router.post('/api/blog', blog.addOrUpdatePost);
router.put('/api/blog', blog.addOrUpdatePost);
router.delete('/api/blog/:ID', blog.deletePost);

//admin dashboard
router.get('/api/statistics', metapublications.getStatistics);
router.get('/api/downloads', downloads.getDownloads);
router.post('/api/downloads', downloads.createDownload);
router.put('/api/downloads', downloads.updateDownload);
