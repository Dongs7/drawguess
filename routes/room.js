var express = require('express');
var router = express.Router();
var expressSession = require('express-session');
var cookieParser = require('cookie-parser');
var mongoose = require('mongoose');



var socket = require('socket.io');
var app = require('express')();
var server = require('http').Server(app);
var io = socket.listen(server);

//nsp.emit('hi', 'everyone!');

var nsp = io.of('/room/test');
var roomnumber = 0;

var clients = [];
var sequence = 1;
var status = '';
var answer = 'banana';
// Listen for incoming connections from clients


// =====================================
// TEST ================================
// =====================================
// test room
router.get('/apple', function(req, res, next) {
  res.render('room', { user: req.cookies.login, room: 'apple' });
});




module.exports = router;