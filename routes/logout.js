var express = require('express');
var router = express.Router();
var passport = require('passport');
var expressSession = require('express-session');
var cookieParser = require('cookie-parser');
var mongoose = require('mongoose');

var Account = require('../models/accounts.js');
//var c = require('./cookie.js')


// =====================================
// LOGOUT ==============================
// =====================================
router.get('/', function(req, res, next) {
  res.clearCookie('login');
  var initialLogin = { guest: true };
  res.cookie('login', initialLogin, { maxAge: 900000, httpOnly: true });
  next();
});

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {
  // if user is authenticated in the session, carry on 
  if (req.isAuthenticated())
    return next();

  // if they aren't redirect them to the home page
  res.redirect('/');
}




module.exports = router;
