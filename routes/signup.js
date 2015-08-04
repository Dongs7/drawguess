/**
 * Created by Yang on 15/7/26.
 */

var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var accountModel = require('../models/accounts.js');

/* GET home page. */
router.get('/', function (req, res) {
    res.render('signup', {title: 'Create new account'});
});

// create new account
// and then redirect to login
router.post('/submit', function (req, res) {
    var count = 0;
    accountModel.count({}, function(err, result){
        count = result;
    });
    var new_account = req.body;
    accountModel.findOne({'username': new_account.username},function(req,result){
        if (result){
            console.log("Username exists.");
            var message = "Username exists.";
            res.render('signup', {message: message});
        }
        else {
            var account = new accountModel(
                {
                    user_id: count,
                    "username": new_account.username,
                    "password": new_account.password
                });
            account.save(function(err,res){
                if (err) throw  err;
            });
            res.redirect('/login');
        }
    });
});

module.exports = router;