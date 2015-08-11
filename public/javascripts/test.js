$(function () {
    // Handler for .ready() called.
    //var socket = io('/test');
    //var socket = io();
    //alert(room);

    var room = $('div#room').text();
    var socket = io.connect(location.origin + '/room/' + room);


    var user_count = 0;
    //Join game

    //alert('songa');
    var guest = $('div#infobox div#guest').text();
    var cookie = new Object();
    cookie.guest = guest;
    if (guest == 'false') {
        cookie.id = $('div#infobox div#id').text();
        cookie.name = $('div#infobox div#nickname').text();
    }
    socket.emit('join', cookie);

    //read players number
    socket.on('count', function (clients) {
        user_count = clients.length;
        $('#count').text(user_count);

        $('div.player ul').empty();
        for (var i = 0; i < user_count; i++) {
            $('div.player ul').append($('<li>').text(clients[i]));
        }
    });

    // read answer from server and start game
    socket.on('answer', function (answer) {
        if (answer) {
            $('p#answer').text(answer);
        }
        else {
            $('p#answer').text('');
        }
    });

    // read status from server
    socket.on('status', function (status) {
        $('span#status').text(status);
    });

    // read timer from server
    socket.on('timer', function (timer) {
        if (timer == -1) {
            $('p#timer').text('');
        } else {
            $('p#timer').text(timer + 's');
        }
    });

    socket.on('info', function (msg) {
        $('ul#list').append($('<li>').text('Sys: ' + msg));
    });


    //Emit messages what user enter
    $('form.chatbox').submit(function () {
        socket.emit('chat', $('#chat').val(), $('div#infobox div#nickname').text());
        $('#chat').val('');
        return false;
    });

    //This code will post user messages on div#message box and automatically scrolling down when new messages are added

    socket.on('chat', function (msg) {
        console.log(guest);
        console.log(msg);
        console.log(cookie.name);
        if (guest == 'true') {
            $('ul#list').append($('<li>').text(('guest: ' + msg)));
        }
        else {
            $('ul#list').append($('<li>').text((msg)));
        }
        $('#messages').scrollTop($('#messages')[0].scrollHeight);
    });

    // $(window).unload(function () {
    //     socket.emit('leave');
    //     return true;
    // });
    
    $(window).on('beforeunload', function() {
        alert('zou');
        socket.emit('leave');
    });

    // canvas draw
    //alert('draw');


    var ctx = document.getElementById('canvas').getContext("2d");

    fitToContainer(document.getElementById('canvas'));

    function fitToContainer(canvas) {
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    }

    // Generate an unique ID
    var id = Math.round($.now() * Math.random());

    // default for the room setting
    var draw = false;
    var answer = '';

    // default attribute
    var curColor = "#000000";
    var curSize = 5;
    var drawing = false;

    // variables for canvas
    var clients = new Array();
    var cursors = new Array();
    var clickX = new Array();
    var clickY = new Array();
    var clickDrag = new Array();
    var clickColor = new Array();
    var clickSize = new Array();

    // when the client gets the answer, it means he is the drawer
    //socket.on('answer', function (answer) {
    //    answer = answer;
    //});

    socket.on('draw', function (value) {
        draw = value;
    });

    socket.on('moving', function (data) {
        this.clickX = data.x;
        this.clickY = data.y;
        this.clickDrag = data.drag;
        this.clickColor = data.color;
        this.clickSize = data.size;

        if (!(data.id in clients)) {
            // a new user has come online. create a cursor for them
            cursors[data.id] = $('<div class="cursor">').appendTo('#cursors');
        }

        // Is the user drawing?
        if (data.drawing && clients[data.id]) {

            // Draw a line on the canvas. clients[data.id] holds
            // the ious position of this user's mouse pointer
            //alert("data.x = " + data.x + "; data.y = " + data.y);
            drawLine(this.clickX, this.clickY, this.clickDrag, this.clickColor, this.clickSize);
        }

        // Saving the current client state
        clients[data.id] = data;
        clients[data.id].updated = $.now();
    });

    function addClick(x, y, dragging) {
        clickX.push(x);
        clickY.push(y);
        clickDrag.push(dragging);
        clickColor.push(curColor);
        clickSize.push(curSize);
    }

    $('#canvas').mousedown(function (e) {
        if (draw) {
            e.preventDefault();
            var x = e.offsetX;
            var y = e.offsetY;
            drawing = true;

            addClick(x, y);
            if ($.now() - lastEmit > 10) {
                socket.emit('mousemove', {
                    'x': clickX,
                    'y': clickY,
                    'drawing': drawing,
                    'drag': clickDrag,
                    'color': clickColor,
                    'size': clickSize,
                    'id': id
                });
                lastEmit = $.now();
            }

            drawLine(clickX, clickY, clickDrag, clickColor, clickSize);
        }
    });

    $('#canvas').mouseup(function (e) {
        drawing = false;
    });

    $('#canvas').mouseleave(function (e) {
        drawing = false;
    });

    var lastEmit = $.now();

    $('#canvas').mousemove(function (e) {
        if (draw) {

            if ($.now() - lastEmit > 10) {
                socket.emit('mousemove', {
                    'x': clickX,
                    'y': clickY,
                    'drawing': drawing,
                    'drag': clickDrag,
                    'color': clickColor,
                    'size': clickSize,
                    'id': id
                });
                lastEmit = $.now();
            }

            // Draw a line for the current user's movement, as it is
            // not received in the socket.on('moving') event above

            if (drawing) {
                addClick(e.offsetX, e.offsetY, true);
                drawLine(clickX, clickY, clickDrag, clickColor, clickSize);
            }
        }
    });

    // Remove inactive clients after 10 seconds of inactivity
//     setInterval(function () {
//         for (ident in clients) {
//             if ($.now() - clients[ident].updated > 10000) {
// 
//                 // Last update was more than 10 seconds ago.
//                 // This user has probably closed the page
//                 cursors[ident].remove();
//                 delete clients[ident];
//                 delete cursors[ident];
//             }
//         }
// 
//     }, 10000);

    //alert('draw');

    $('#black').click(function () {
        curColor = "#000000";
    });

    $('#brown').click(function () {
        curColor = "#A52A2A";
    });

    $('#white').click(function () {
        curColor = "#ffffff";
    });

    $('#gray').click(function () {
        curColor = "#808080";
    });

    $('#red').click(function () {
        curColor = "#ff0000";
    });

    $('#orange').click(function () {
        curColor = "#ffa500";
    });

    $('#yellow').click(function () {
        curColor = "#ffcf33";
    });

    $('#green').click(function () {
        curColor = "#659b41";
    });

    $('#blue').click(function () {
        curColor = "#0000ff";
    });

    $('#purple').click(function () {
        curColor = "#cb3594";
    });

    $('#eraser').click(function () {
        curColor = "#ffffff";
    });

    $('#small').click(function () {
        curSize = 2;
    });

    $('#normal').click(function () {
        curSize = 5;
    });

    $('#large').click(function () {
        curSize = 10;
    });

    $('#superlarge').click(function () {
        curSize = 20;
    });

    $('#clear').click(function () {
        clickColor = [];
        clickSize = [];
        clickDrag = [];
        clickX = [];
        clickY = [];
        drawLine(clickX, clickY, clickDrag, clickColor, clickSize);
    });

    function drawLine(clickX, clickY, clickDrag, clickColor, clickSize) {
        //alert("data.x = " + fromx + "; data.y = " + fromy);
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); // Clears the canvas
        ctx.lineJoin = "round";
        for (var i = 0; i < clickX.length; i++) {
            ctx.beginPath();
            if (clickDrag[i] && i) {
                ctx.moveTo(clickX[i - 1], clickY[i - 1]);
            } else {
                ctx.moveTo(clickX[i] - 1, clickY[i]);
            }
            ctx.lineTo(clickX[i], clickY[i]);
            ctx.closePath();
            ctx.strokeStyle = clickColor[i];
            ctx.lineWidth = clickSize[i];
            ctx.stroke();
        }
    };

    //background Audio Control
    var songs =
        [
            {filename: '/bgmusic/tr1.mp3'},
            {filename: '/bgmusic/tr2.mp3'},
            {filename: '/bgmusic/tr3.mp3'}
        ];
    var randomTrack = Math.floor(Math.random() * songs.length) + 1;
    var song = songs[randomTrack];
    // var loc = document.querySelector('source').src = song.filename;

    var bgPlayer = document.getElementById('bgplayer');
    var ctrl = document.getElementById('playerControl');
    var play = document.getElementById('play');
    var pause = document.getElementById('pause');
    var prev = document.getElementById('prev');
    var next = document.getElementById('next');

    bgPlayer.addEventListener("ended", function () {
        bgPlayer.src = "/bgmusic/tr" + (randomTrack) + ".mp3";
        bgPlayer.play();
    })
    function toggleAudioImage() {
        if (play.style.display === 'none') {
            play.style.display = 'inline';
            pause.style.display = 'none';
            prev.style.display = 'inline';
            next.style.display = 'inline';
        }
        else {
            play.style.display = 'none';
            pause.style.display = 'inline';
            prev.style.display = 'inline';
            next.style.display = 'inline';
        }
    }

    ctrl.onclick = function () {
        if (bgPlayer.paused) {
            //bgPlayer.src = '/bgmusic/tr' + randomTrack + '.mp3';
            bgPlayer.play();
        }

        else {
            bgPlayer.pause();
        }

        toggleAudioImage();

        return false;
    };
});