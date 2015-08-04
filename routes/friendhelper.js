var express = require('express');
var router = express.Router();
var expressSession = require('express-session');
var cookieParser = require('cookie-parser');
var mongoose = require('mongoose');

var account = require('../models/accounts.js');

var getFriendList = function(id){
	account.findOne({_id: id}, 
		{"friends._id": true, "friends.accept": true}, 
		function(err, doc){
			if(err) throw err;
			return doc.friends;
		}
	);
};


var getNicknameById = function(id){
	account.findOne({_id: id}, 
		{nickname: true},
		function(err, doc){
			if(err) throw err;
			return doc.nickname;
		}
	);
};



module.exports = getFriendList;

