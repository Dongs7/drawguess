/**
 * Created by Yang on 15/7/27.
 */
var express = require('express');
var router = express.Router();
var passport = require('passport');
var cookieParser = require('cookie-parser');
var mongoose = require('mongoose');

var account = require('../models/accounts.js');

router.get('/', function(req, res, next) {
    res.render('mainpage', { user: req.cookies.login.id });
});

module.exports = router;
