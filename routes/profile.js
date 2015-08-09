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


router.get('/view/:user_id', function (req, res) {
    var body = {
        username: '',
        nickname: '',
        friends: [],
        point: '',
        reputation: ''
    }
    account.findOne({_id: req.params.user_id},
        //{_id: 1, firrestname: 1, lastname: 1},
        function (err, doc) {
            if (err)
                throw err;
            body.username = doc.username;
            if (doc.nickname)
                body.nickname = doc.nickname;
            body.friends = doc.friends;
            res.render('profile', {
                user: body.username // get the user out of session and pass to template
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
