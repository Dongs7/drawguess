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

router.get('/friend', function (req, res) {
    console.log("Time to add friend.")
    var cookies = req.cookies.login;
    addFriend(mongoose.Types.ObjectId("55b56b060821dc7310ad7096"), cookies.id);
});


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

function addFriend(id_A, id_B) {
    var accept = false;

    // first check whether B has already added A
    account.findOne({id: id_B, 'friends.user_id': id_A}, function (err, userB) {
        if (userB) {
            accept = true;
            for (var i = 0; i < userB.friends.length; i++) {
                if (userB.friends[i].user_id == id_A) {
                    userB.friends[i].accept = true;
                }
            }
            userB.save(function (e) {
                if (e) throw e;
            });
        }
        // user A add user B as friend
        account.findOne({id: id_A}, function (err, userA) {
            if (err) throw err;
            userA.friends.push({
                user_id: id_B,
                accept: accept,
                time: Date.now()
            });
            userA.save(function (e) {
                if (e) throw e;
            });
        });
    });


}

function removeFriend(id_A, id_B) {
    // first remove A in B
    account.findOne({id: id_B, 'friends.user_id': id_A}, function (err, userB) {
        if (userB) {
            for (var i = 0; i < userB.friends.length; i++) {
                if (userB.friends[i].user_id == id_A) {
                    userB.friends[i].remove();
                }
            }
            userB.save(function (e) {
                if (e) throw e;
            });
        }
    });

    // then remove B in A
    account.findOne({id: id_A, 'friends.user_id': id_B}, function (err, userA) {
        if (userA) {
            for (var i = 0; i < userA.friends.length; i++) {
                if (userA.friends[i].user_id == id_B) {
                    userA.friends[i].remove();
                }
            }
            userB.save(function (e) {
                if (e) throw e;
            });
        }
    });
}

module.exports = router;
