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
  
  res.render('index');
});


// =====================================
// LOGIN ===============================
// =====================================
// show the login form
router.get('/login', function(req, res, next) {
  res.render('login', { user: req.session.name });
});


// process the login form
router.post('/login', function(req, res, next){
  Account.findOne( {username: req.body.username, password: req.body.password},
    //{_id: 1, firstname: 1, lastname: 1},
    function(err, doc){
      if(err){
        throw err;
      }else{
        req.session.name = doc.username;
        req.session.level = doc.level;
        req.session.point = doc.point;
        
        var hour = 900000;
        req.session.cookie.expires = new Date(Date.now() + hour);
        req.session.cookie.maxAge = hour;
        
        req.session.save(function(e) {
          // session saved
          if(e) throw e;
          res.redirect('/cookie');
        });
      }
  });
});

// =====================================
// SIGNUP ==============================
// =====================================
// show the signup form
router.get('/signup', function(req, res) {
  res.render('signup');
});

// process the signup form
router.post('/signup', function(req, res, next){
  
});

// =====================================
// PROFILE SECTION =====================
// =====================================
// we will want this protected so you have to be logged in to visit
// we will use route middleware to verify this (the isLoggedIn function)
router.get('/profile/:id', isLoggedIn, function(req, res) {
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
