var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');

var socket = require('socket.io');
var app = require('express')();
var server = require('http').Server(app);
var io = socket.listen(server);

//var serv = require('http').Server(app);

//var	io = require('socket.io')(8080);
var	stat = require('node-static'); // for serving files

// This will make all the files in the current folder
// accessible from the web
var fileServer = new stat.Server('./');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'node_modules')));

app.use('/', routes);
app.use('/users', users);

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

// Listen for incoming connections from clients
io.on('connection', function (socket) {

	// Start listening for mouse move events
	socket.on('mousemove', function (data) {

		// This line sends the event (broadcasts it)
		// to everyone except the originating client.
		socket.broadcast.emit('moving', data);
	});
});

server.listen(8080);

module.exports = app;

