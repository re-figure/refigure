'use strict';

const express = require('express');
const router = express.Router();

const auth = require('./auth');
const users = require('./users');
const captcha = require('./captcha');

const homePage = __dirname + '/../build/';
const staticOptions = {};

module.exports = router;

// static pages router
router.use(express.static(homePage, staticOptions));

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

