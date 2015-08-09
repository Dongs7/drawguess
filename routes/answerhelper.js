/**
 * Created by Yang on 15/8/8.
 */
var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var answerModel = require('../models/answer.js');


// create new answer
router.get('/add/fruit', function (req, res) {
    var answer = new answerModel(
        {
            "keyword": "fruit",
            "answers": ['apple','banana','blueberry','cherry','watermelon','kiwi fruit','lemon','mango','pineapple','peach','orange','grape']
        });
    answer.save(function(err,res){
        if (err) throw  err;
    });
    res.redirect('/');
});

module.exports = router;
