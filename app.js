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
var stat = require('node-static'); // for serving files
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
var answerhelper = require('./routes/answerhelper');
var friendhelper = require('./routes/friendhelper');

// get answer from database
var answers = require('./models/answer.js');
var accounts = require('./models/accounts.js');
var already_answer = [];

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
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
app.use('/answer', answerhelper);
app.use('/friend', friendhelper);

app.get(function (req, res, next) {
    req.addListener('end', function () {
        fileServer.serve(req, res);
    });
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


// Delete this row if you want to see debug messages
//io.set('log level', 1);


var clients_apple = [],
    clients_banana = [],
    clients_orange = [];
var auth_apple = [], names_apple = [],
    auth_banana = [], names_banana = [],
    auth_orange = [], names_orange = [];
var drawer_apple, drawer_banana, drawer_orange;
var status_apple = 'waiting',
    status_banana = 'waiting',
    status_orange = 'waiting';
var answer_apple, answer_banana, answer_orange;
var passed_apple = [],
    passed_banana = [],
    passed_orange = [];
var timer_apple, timer_banana, timer_orange;

// roundTime can be reset from config file
var roundTime = 50;
var currentRoundTime_apple, currentRoundTime_banana, currentRoundTime_orange;

answer_apple = answer_banana = answer_orange = 'banana';
currentRoundTime_apple = currentRoundTime_banana = currentRoundTime_orange = roundTime;


function updateStatus(roomname, value) {
    switch (roomname) {
        case 'apple':
            status_apple = value;
        case 'banana':
            status_banana = value;
        case 'orange':
            status_orange = value;
    }
};

function updateAnswer(roomname, value) {
    switch (roomname) {
        case 'apple':
            answer_apple = value;
        case 'banana':
            answer_banana = value;
        case 'orange':
            answer_orange = value;
    }
};

function updateDrawer(roomname, value) {
    switch (roomname) {
        case 'apple':
            drawer_apple = value;
        case 'banana':
            drawer_banana = value;
        case 'orange':
            drawer_orange = value;
    }
}

// start counting down ingame
function countDown(room, currentRoundTime, timer, status, clients, drawer, answer) {
    //stopcountDown(timer);
    currentRoundTime = roundTime;
    timer = setInterval(function () {
        room.emit('timer', currentRoundTime--);
        if (currentRoundTime == -1) {
            timeUp(room, timer);

            setTimeout(function () {
                startGame(room, currentRoundTime, timer, status, clients, drawer, answer);
            }, 3000)
        }
    }, 1000);
};

function timeUp(room, timer) {
    clearInterval(timer);
    room.emit('timer', 'time\'s up!');
    updateStatus(room.name.substring(6), 'waiting');
    room.emit('status', 'waiting');
};

function stopcountDown(timer) {
    clearInterval(timer);
};


// control the new instance of game
function startGame(room, currentRoundTime, timer, status, clients, drawer, answer) {
    status = 'ingame';

    var roomname = room.name.substring(6);
    updateStatus(roomname, status);
    // randomly pick a player to be drawer (unique)
    var randomClient = Math.floor(Math.random() * clients.length);
    drawer = clients[randomClient];
    updateDrawer(roomname, drawer);

    room.emit('draw', false);
    room.emit('answer', null);

    // roll an answer and send it to drawer
    answers.findOne({ keyword: 'fruit' }, { answers: true }, function (err, doc) {
        var randomAnswer = Math.floor(Math.random() * doc.answers.length);
        while (passed_apple.indexOf(randomAnswer) > -1) {
            if (passed_apple.length == doc.answers.length) {
                passed_apple = [];
            }
            randomAnswer = Math.floor(Math.random() * doc.answers.length);
        }
        passed_apple.push(randomAnswer);
        answer = doc.answers[randomAnswer];
        updateAnswer(roomname, answer);
    });

    drawer.emit('draw', true);
    drawer.emit('answer', answer);
    room.emit('status', status);

    //broadcast the timer
    countDown(room, currentRoundTime, timer, status, clients, drawer, answer);
};


var apple = io.of('/room/apple'),
    banana = io.of('/room/banana'),
    orange = io.of('/room/orange');
// Listen for incoming connections from clients
apple.on('connection', function (socket) {
    // Start listening for mouse move events
    socket.on('mousemove', function (data) {
        // This line sends the event (broadcasts it)
        // to everyone except the originating client.
        socket.broadcast.emit('moving', data);
    });

    //send msg and display it on console
    //broadcast all msg to users
    socket.on('chat', function (msg) {
        // msg block enabled during the game
        if (status_apple == 'ingame') {
            // if someone input the answer
            if (msg.trim() == answer_apple) {
                if (socket == drawer_apple) {
                    drawer_apple.emit('info', 'drawer can\'t type your answer!');
                    return;
                }
                else {
                    // win the game (guess the answer)
                    apple.emit('chat', msg);
                    apple.emit('info', 'someone guess the answer!');
                    var instance = new accounts();

                    var index = clients_apple.indexOf(drawer_apple);
                    var info;
                    if (index > -1 && auth_apple[index] != 'guest') {
                        info = instance.winner(auth_apple[index], 10);
                        if (info) {
                            apple.emit('info', info);
                        }
                    }

                    index = clients_apple.indexOf(socket);
                    if (index > -1 && auth_apple[index] != 'guest') {
                        info = instance.winner(auth_apple[index], 10);
                        if (info) {
                            apple.emit('info', info);
                        }
                    }

                    return;
                }
            }
            else if (socket == drawer_apple && msg.indexOf(answer_apple) > -1) {
                drawer_apple.emit('info', 'drawer can\'t type your answer!');
                return;
            }
        }
        apple.emit('chat', msg);
    });


    socket.on('clock', function (time) {
        apple.emit('clock', time);
    });

    // when new client enter room
    socket.on('join', function (cookie) {
        console.log('New client connected (id=' + socket.id + ').');
        clients_apple.push(socket);
        if(cookie.guest == 'true'){
            auth_apple.push('guest');
            names_apple.push('guest');
        }
        else{
            auth_apple.push(cookie.id);
            names_apple.push(cookie.name);
        }

        // when there are enough player to play the game
        if (clients_apple.length === 2) {
            startGame(apple, currentRoundTime_apple, timer_apple, status_apple, clients_apple, drawer_apple, answer_apple);
        }

        // status should be boardcast to every new player
        apple.emit('count', names_apple);
        apple.emit('status', status_apple);
    });

    // when client leave room
    socket.on('leave', function () {
        var index = clients_apple.indexOf(socket);
        if (index != -1) {
            clients_apple.splice(index, 1);
            auth_apple.splice(index, 1);
            names_apple.splice(index, 1);
            console.log('Client gone (id=' + socket.id + ') from room apple.');

            // if there's no enough players left inside this room
            if (clients_apple.length <= 1) {
                status_apple = 'waiting';
                stopcountDown(timer_apple);
            }
            // if the player leaves the game but still enough players left inside this room
            else if (drawer_apple == socket) {
                // here need to reset the game
                stopcountDown(timer_apple);
                startGame(apple, currentRoundTime_apple, timer_apple, status_apple, clients_apple, drawer_apple, answer_apple);
            }

            apple.emit('status', status_apple);
            apple.emit('count', names_apple);
        }

        // if this player is not in the list, then report the error
        console.log('error: client unknown leaves, socket id: ' + socket.id + ' at ' + Date.now());
    });

    //send console a disconnected msg when user left the page
    socket.on('disconnect', function () {
    });
});


server.listen(8080);

module.exports = app;

