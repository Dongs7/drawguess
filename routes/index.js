var express = require('express');
var router = express.Router();
var passport = require('passport');
var expressSession = require('express-session');
var cookieParser = require('cookie-parser');
var mongoose = require('mongoose');

var Account = require('../models/accounts.js');
//var c = require('./cookie.js')

router.use(function(req, res, next){
  var cookie = req.cookies.login;
  //var login = req.session.login;
  if(!cookie){
    var initialLogin = { guest: true };
    res.cookie('login', initialLogin, { maxAge: 900000, httpOnly: true });
  }
  next();
});

router.get('/cookie', function(req, res, next) {
  var cookie = req.cookies.login;
  cookie.guest = false;
  res.cookie('login', cookie, { maxAge: 900000, httpOnly: true });
  res.send(req.cookies.login);
  //c.clearCookie(res, 'login');
  //next();
});

router.get('/', function(req, res, next) {
    res.redirect('/login');
});



module.exports = router;
