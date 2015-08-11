var express = require('express');
var router = express.Router();
var passport = require('passport');
var expressSession = require('express-session');
var cookieParser = require('cookie-parser');
var mongoose = require('mongoose');

var account = require('../models/accounts.js');

// =====================================
// PROFILE SECTION =====================
// =====================================
// we will want this protected so you have to be logged in to visit
// we will use route middleware to verify this (the isLoggedIn function)

router.get('/', function (req, res) {
    var login = req.cookies.login;
    if(!login || login.guest){
        res.redirect('login');
    }
    res.redirect('/profile/view/'+login.id);
});



router.get('/view/:user_id', function (req, res) {
    account.findOne({_id: req.params.user_id},
        {_id: true, username: true, nickname: true, level: true, point: true},
        function (err, doc) {
            if (err)
                throw err;
            if (!doc.nickname) {
                doc.nickname = doc.username;
            }
            res.render('profile', {
                user: doc // get the user out of session and pass to template
            });
        });
});

router.post('/update/:user_id', function (req, res) {
    account.findOne({_id: req.params.user_id},
        {_id: true, nickname: true},
        function (err, doc) {
            if (err)
                throw err;
            doc.nickname = req.body.nickname;
            
            doc.save(function(e){
               if(e) throw e; 
            });
            res.render('profile', {
                user: doc // get the user out of session and pass to template
            });
        });
});

router.get('/search', function (req, res) {
    var login = req.cookies.login;

    var query = req.query.q;
    account.find({$or: [{'username': new RegExp(query, 'i')}, {'nickname': new RegExp(query, 'i')}]},
        {username: true, nickname: true, email: true},
        function (err, docs) {
            //if(err) throw err;
            if (!login.guest) {
                //var friendlist = account.find({},{_id: true});
            }
            res.render('search', {users: docs, count: docs.length});
        });
});


module.exports = router;
