var express = require('express');
var router = express.Router();
var expressSession = require('express-session');
var cookieParser = require('cookie-parser');
var mongoose = require('mongoose');

var account = require('../models/accounts.js');


router.get('/', function (req, res) {
    console.log("Time to add friend.")
    var cookies = req.cookies.login;
    addFriend(cookies.id, mongoose.Types.ObjectId("55b918341808fbf636716d2d"));
    res.redirect('/');
});

router.get('/getFriendList', function (req, res) {
    console.log("Gets friends.")
    var cookies = req.cookies.login;
    var list = getFriendList(cookies.id)
    res.redirect('/');
});

var getFriendList = function (id) {
    account.findOne({_id: id}).populate("friends.user_id","-password").exec(function (err, doc) {
            if (err) throw err;
            console.log(doc);
            return doc;
        }
    );
};


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
            userB.save(function (e) {
                if (e) throw e;
            });
        }
    });
}


module.exports = router;

