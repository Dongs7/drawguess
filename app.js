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

// get answer from database
var answers = require('./models/answer.js');

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
var drawer;
var sequence = 1;
var status = 'waiting';
var answer = 'banana';
var timer;
var roundTime = 10;
var currentRoundTime = roundTime;
// Listen for incoming connections from clients
io.on('connection', function (socket) {
	// Start listening for mouse move events
  
  // start counting down ingame
  function countDown(){
    currentRoundTime = roundTime;
    timer = setInterval(function() { 
        io.emit('timer', currentRoundTime--);
        if(currentRoundTime ==  -1){
          timeUp();
        }
        //console.log('timer: ' + currentRoundTime);
        }, 1000);
  };
  
  function stopcountDown(){
    clearInterval(timer);
  };
  
  
  // control the new instance of game
  function startGame(){
    status = 'ingame';
      
    // randomly pick a player to be drawer (unique)
    var randomClient = Math.floor(Math.random() * clients.length);
    drawer = clients[randomClient];
    
    // roll an answer and send it to drawer
    answers.findOne({keyword: 'default'}, {answers: true}, function(err, doc){
      var randomAnswer = Math.floor(Math.random() * doc.length);
      answer = doc[randomAnswer];
    })
    drawer.emit('answer', answer);
      
    //broadcast the timer
    countDown();
  };
  
  function timeUp(){
    clearInterval(timer);
    io.emit('timer', 'time\'s up!');
    
    setTimeout(function () {
      startGame();
    }, 3000)
  };
  
  
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
  
  
  socket.on('chat', function(msg){
    if(status == 'ingame' && msg.trim() == answer){
      // win the game
      console.log('winner!');
    }
    
    
    io.emit('chat', msg);
  });
  
  
  socket.on('clock', function(time){
    io.emit('clock', time);
  });
  
  // when new client enter room
  socket.on('join', function(){    
    console.log('New client connected (id=' + socket.id + ').');
    clients.push(socket);
    
    // when there are enough player to play the game
    if(clients.length === 2){
      startGame();
    }
    
    // status should be boardcast to every new player
    io.emit('count', clients.length);
    socket.emit('status', status);
  });
  
  // when client leave room
  socket.on('leave', function(){
    var index = clients.indexOf(socket);
    if (index != -1) {
        clients.splice(index, 1);
        console.log('Client gone (id=' + socket.id + ').');
        
        // if there's no enough players left inside this room
        if(clients.length <= 1){
          status = 'waiting';
          stopcountDown();
        }
        // if the player leaves the game but still enough players left inside this room
        else if(drawer == socket){
          // here need to reset the game
          stopcountDown();
          startGame();
        }
        
        io.emit('status', status);
        io.emit('count', clients.length);
    }
    
    // if this player is not in the list, then report the error
    console.log('error: client unknown leaves, socket id: '+socket.id+' at '+ Date.now() );
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

var test = io.of('/room/test');
test.on('connection', function (socket) {
  console.log('Special');
	// Start listening for mouse move events
	socket.on('mousemove', function (data) {
		// This line sends the event (broadcasts it)
		// to everyone except the originating client.
		socket.broadcast.emit('moving', data);
	});
  
  //send msg and display it on console
  //broadcast all msg to users
  socket.on('chat', function(msg){
    console.log('message: ' + msg);
    test.emit('chat',msg);
    //socket.broadcast.emit('chat', msg);
  });
      
  socket.on('test', function(msg){
    test.emit('test', msg);
  });
  
  // when new client enter room
  socket.on('join', function(){    
    console.log('New client connected (id=' + socket.id + ').');
    clients.push(socket);
    test.emit('count', clients.length);
    
    // when there are enough player to play the game
    if(clients.length === 2){
      status = 'ingame';
      var randomClient = Math.floor(Math.random() * clients.length);
      test.emit('status', status);
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
    test.emit('count', clients.length);
  });
	
	//send console a disconnected msg when user left the page
	socket.on('disconnect', function(){
  });
});

server.listen(8080);

module.exports = app;

