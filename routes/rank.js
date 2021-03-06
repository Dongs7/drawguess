/**
 * Created by Yang on 15/8/3.
 */
var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

var account = require('../models/accounts.js');

router.get('/', function (req, res) {
    console.log("Show the best players.")
    account.find({}, {nickname: true, point: true, level: true}).sort([['point', -1]]).limit(8).exec(function (err, users) {
        if (err) throw err;
        console.log(users);
        res.render('rank', {
            users: users
        });
    });
});


module.exports = router;
