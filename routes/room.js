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



// =====================================
// TEST ================================
// =====================================
// test room
router.get('/test', function(req, res, next) {
  res.render('room', { user: req.cookies.login });
});




module.exports = router;