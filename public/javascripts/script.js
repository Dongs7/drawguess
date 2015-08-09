$(function () {

    //// This demo depends on the canvas element
    //if(!('getctx' in document.createElement('canvas'))){
    //	alert('Sorry, it looks like your browser does not support canvas!');
    //	return false;
    //}

    // The URL of your web server (the port is set in app.js)
    var url = 'http://localhost:8080';

    var ctx = document.getElementById('canvas').getContext("2d");

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

    var socket = io.connect(url);

    // when the client gets the answer, it means he is the drawer
    socket.on('answer', function (answer) {
        answer = answer;
    });

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
            var x = e.pageX - this.offsetLeft;
            var y = e.pageY - this.offsetTop;
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
                addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop, true);
                drawLine(clickX, clickY, clickDrag, clickColor, clickSize);
            }
        }
    });

    // Remove inactive clients after 10 seconds of inactivity
    setInterval(function () {
        for (ident in clients) {
            if ($.now() - clients[ident].updated > 10000) {

                // Last update was more than 10 seconds ago.
                // This user has probably closed the page

                cursors[ident].remove();
                delete clients[ident];
                delete cursors[ident];
            }
        }

    }, 10000);

    $('#purple').click(function () {
        curColor = "#cb3594";
    });

    $('#green').click(function () {
        curColor = "#659b41";
    });

    $('#yellow').click(function () {
        curColor = "#ffcf33";
    });

    $('#brown').click(function () {
        curColor = "#986928";
    });

    $('#black').click(function () {
        curColor = "#000000";
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

    $('#redraw').click(function () {
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
    }
});