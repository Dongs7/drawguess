var express = require('express');
var router = express.Router();
var passport = require('passport');


// =====================================
// LOGIN ===============================
// =====================================
// show the login form
router.get('/', function(req, res, next) {
  res.render('login', { message: req.flash('loginMessage') });
});


// process the login form
// app.post('/login', do all our passport stuff here);

// =====================================
// SIGNUP ==============================
// =====================================
// show the signup form
router.get('/signup', function(req, res) {
  // render the page and pass in any flash data if it exists
  res.render('signup.ejs', { message: req.flash('signupMessage') });
});






module.exports = router;