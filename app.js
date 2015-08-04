var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var socket = require('socket.io');
var app = require('express')();
var server = require('http').Server(app);
var io = socket.listen(server);

//var serv = require('http').Server(app);

//var	io = require('socket.io')(8080);
var	stat = require('node-static'); // for serving files
var session = require('express-session');
//var passport = require('passport');
var flash = require('connect-flash');

// This will make all the files in the current folder
// accessible from the web
var fileServer = new stat.Server('./');

var routes = require('./routes/index');
var users = require('./routes/users');
var login = require('./routes/login');
var logout = require('./routes/logout');
var signup = require('./routes/signup');
var profile = require('./routes/profile');
var room = require('./routes/room');
var hall = require('./routes/hall');
var ranking = require('./routes/ranking');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser("draw and guess"));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'node_modules')));


app.use(flash()); // use connect-flash for flash messages stored in session

app.use(session({
  secret: 'draw and guess',
  resave: false,
  saveUninitialized: true,
  cookie: {secure: true}
}))

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/final');

app.use('/', routes);
app.use('/users', users);
app.use('/login', login);
app.use('/logout', logout);
app.use('/signup', signup);
app.use('/profile', profile);
app.use('/room', room);
app.use('/hall', hall);
app.user();

app.get(function(req, res, next) {
	req.addListener('end', function () {
        fileServer.serve(req, res);
  });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


// Delete this row if you want to see debug messages
//io.set('log level', 1);


var clients = [];
var sequence = 1;
var status = '';
var answer = 'banana';
// Listen for incoming connections from clients
io.on('connection', function (socket) {
	// Start listening for mouse move events
	socket.on('mousemove', function (data) {

		// This line sends the event (broadcasts it)
		// to everyone except the originating client.
		socket.broadcast.emit('moving', data);
	});
  
  //send msg and display it on console
  //broadcast all msg to users
  socket.on('chat message', function(msg){
    console.log('message: ' + msg);
    io.emit('chat message', msg);
  });
      
  socket.on('test', function(msg){
    io.emit('test', msg);
  });
  
  // when new client enter room
  socket.on('join', function(){    
    console.log('New client connected (id=' + socket.id + ').');
    clients.push(socket);
    io.emit('count', clients.length);
    
    // when there are enough player to play the game
    if(clients.length === 2){
      status = 'ingame';
      var randomClient = Math.floor(Math.random() * clients.length);
      socket.emit('status', status);
      clients[randomClient].emit('answer', answer);
    }
  });
  
  // when client leave room
  socket.on('leave', function(){
    var index = clients.indexOf(socket);
    if (index != -1) {
        clients.splice(index, 1);
        console.log('Client gone (id=' + socket.id + ').');
    }
    io.emit('count', clients.length);
  });
	
	//send console a disconnected msg when user left the page
	socket.on('disconnect', function(){
  });
});


// Every 1 second, sends a message to a random client:
//setInterval(function() {
//    var randomClient;
//    if (clients.length > 0) {
//        randomClient = Math.floor(Math.random() * clients.length);
//        clients[randomClient].emit('test', sequence++);
//    }
//}, 1000);

var nsp = io.of('/test');
var roomnumber = 0;

nsp.on('connection', function(socket){
  roomnumber++;
  console.log('someone connected ' + roomnumber);
  
  socket.on('test', function(msg){
    console.log('message: ' + msg);
    //socket.broadcast.emit('hi');
    //socket.broadcast.emit('chat message', data);
    io.emit('test', msg);
  });
  
  socket.on('disconnect', function(){
    roomnumber--;
    console.log('user disconnected' + roomnumber);
  });
});

server.listen(8080);

module.exports = app;

