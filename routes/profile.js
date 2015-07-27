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
//router.get('/:id', function(req, res) {
//
//  account.findOne( {username: req.body.username, password: req.body.password},
//    //{_id: 1, firestname: 1, lastname: 1},
//    function(err, doc){
//      if(err){
//        throw err;
//      }else{
//        var cookie = req.cookies.login;
//        cookie.id = doc._id;
//        cookie.username = doc.username;
//        cookie.nickname = doc.nickname;
//        cookie.guest = false;
//        res.cookie('login', cookie, { maxAge: 900000, httpOnly: true });
//
//        res.redirect('/');
//      }
//  });
//
//  res.render('profile', {
//    user : req.user // get the user out of session and pass to template
//  });
//});

router.get('/friend', function (req,res) {
    console.log("Time to add friend.")
    var cookies = req.cookies.login;
    addFriend(mongoose.Types.ObjectId("55b5b0420cadda302dfbe0b7"),cookies);
});

// add friend
function addFriend(id,cookie) {
    account.findOne({_id: cookie.id, 'username': cookie.username},function(err, userA){
        if (err){
            throw err;
        }
        else
        {
            account.findOne({_id: id},function(err, userB){
                if (err){
                    throw err;
                }else{
                    // check if A has B's friend request
                    var B_rel = userB.friends.id(cookie._id);
                    console.log(B_rel);
                    if (B_rel){
                        var date = Date.now();
                        B_rel.time = date;
                        B_rel.accept = true;
                        userA.friends.push({
                            user_id: id,
                            accept: true,
                            time: date
                        });
                    }else{
                        // if it's the first time A request friendship with B
                        userA.friends.push({
                            user_id: id,
                            accept: false
                        });
                    }
                    userB.save(function (err) {
                        if (err) return handleError(err)
                    });
                    userA.save(function (err) {
                        if (err) return handleError(err)
                    });
                }
            });
        }
    });
}

module.exports = router;
