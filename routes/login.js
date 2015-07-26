var express = require('express');
var router = express.Router();
//var passport = require('passport');
var expressSession = require('express-session');
var cookieParser = require('cookie-parser');
var mongoose = require('mongoose');

var Account = require('../models/accounts.js');
//var c = require('./cookie.js')

// =====================================
// LOGIN ===============================
// =====================================
// show the login form
router.get('/', function(req, res, next) {
  res.render('login', { user: req.cookies.login });
});


// process the login form
router.post('/', function(req, res, next){
  //var url = req.
  Account.findOne( {username: req.body.username, password: req.body.password},
    //{_id: 1, firrestname: 1, lastname: 1},
    function(err, doc){
      if(err){
        throw err;
      }else{
        var cookie = req.cookies.login;
        cookie.id = doc.id;
        cookie.username = doc.username;
        cookie.nickname = doc.nickname;
        cookie.guest = false;
        res.cookie('login', cookie, { maxAge: 900000, httpOnly: true });
        
        res.redirect('/');
      }
  });
});


module.exports = router;
