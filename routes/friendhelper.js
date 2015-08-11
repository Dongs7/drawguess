var express = require('express');
var router = express.Router();
var expressSession = require('express-session');
var cookieParser = require('cookie-parser');
var mongoose = require('mongoose');

var account = require('../models/accounts.js');


// router.get('/', function (req, res) {
//     console.log("Time to add friend.")
//     var cookies = req.cookies.login;
//     addFriend(cookies.id, mongoose.Types.ObjectId("55b918341808fbf636716d2d"));
//     res.redirect('/');
// });

router.get('/', function(req, res){
    var cookies = req.cookies.login;
    if(!cookies || cookies.guest){
        res.redirect('/login');
    }
    else{
        res.redirect('/friend/' + cookies.id);
    }
});

var friends;
router.get('/:id', function (req, res, next) {
    //var cookies = req.cookies.login;
    var id = req.params.id;
    account.findOne({ _id: id }).populate("friends.user_id", "-password").exec(function (err, doc) {
        if (err) throw err;

        var users = [];
        for (var i = 0; i < doc.friends.length; i++) {
            var obj = {
                id: doc.friends[i].id,
                accept: doc.friends[i].accept,
                username: doc.friends[i].user_id.username,
                nickname: doc.friends[i].user_id.nickname
            };
            users.push(obj);
        }
        friends = users;
        res.render('friend', { page: 'list', users: users });
    });
});

router.post('/search', function (req, res, next) {
    //var cookies = req.cookies.login;
    var query = req.body.name;
    account.find({$or: [{'username': new RegExp(query, 'i')}, {'nickname': new RegExp(query, 'i')}]},
        {username: true, nickname: true, level: true, point: true},
        function (err, docs) {
        if (err) throw err;
        res.render('friend', { page: 'search', users: docs });
    });
});

router.get('/add/:id', function (req, res, next) {
    var cookies = req.cookies.login;
    if(cookies.guest){
        res.redirect('/login');
    }
    
    var id = cookies.id;
    var target_id = req.params.id;
    
    addFriend(id, target_id);
    
    res.redirect('/friend');
});

router.get('/delete/:id', function (req, res, next) {
    var cookies = req.cookies.login;
    if(cookies.guest){
        res.redirect('/login');
    }
    
    var id = cookies.id;
    var target_id = req.params.id;
    
    removeFriend(id, target_id);
    
    res.redirect('/friend');
});


var getNicknameById = function (id) {
    account.findOne({_id: id},
        {nickname: true},
        function (err, doc) {
            if (err) throw err;
            return doc.nickname;
        }
    );
};

function addFriend(id_A, id_B) {
    var accept = false;
    // first check whether B has already added A
    account.findOne({_id: id_B, 'friends.user_id': id_A}, function (err, userB) {
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
        account.findOne({_id: id_A}, function (err, userA) {
            if (err) throw err;
            console.log(userA);
            console.log(userB);
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
    account.findOne({_id: id_B, 'friends.user_id': id_A}, function (err, userB) {
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
    account.findOne({_id: id_A, 'friends.user_id': id_B}, function (err, userA) {
        if (userA) {
            for (var i = 0; i < userA.friends.length; i++) {
                if (userA.friends[i].user_id == id_B) {
                    userA.friends[i].remove();
                }
            }
            userA.save(function (e) {
                if (e) throw e;
            });
        }
    });
}


module.exports = router;

