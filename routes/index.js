var express = require('express');
var router = express.Router();
var passport = require('passport');
var expressSession = require('express-session');
var cookieParser = require('cookie-parser');
var mongoose = require('mongoose');

var Account = require('../models/accounts.js');
var signup = require('../routes/signup.js');
//var c = require('./cookie.js')

router.use('/signup', signup);

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
  res.render('index', {user: req.cookies.login.guest ? 'guest' : req.cookies.login.username });
});


// =====================================
// LOGIN ===============================
// =====================================
// show the login form
router.get('/login', function(req, res, next) {
  res.render('login', { user: req.session.name });
});



// =====================================
// PROFILE SECTION =====================
// =====================================
// we will want this protected so you have to be logged in to visit
// we will use route middleware to verify this (the isLoggedIn function)
router.get('/profile/:id', function(req, res) {
  res.render('profile.ejs', {
    user : req.user // get the user out of session and pass to template
  });
});

// =====================================
// LOGOUT ==============================
// =====================================
router.get('/logout', function(req, res) {
  //req.logout();
  //res.redirect('/');
  res.send('logout as ' + req.session.name);
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
