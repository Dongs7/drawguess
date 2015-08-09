$(function() {
    // Handler for .ready() called.
    //var socket = io('/test');
    var socket = io();
    //alert(room);
    //var socket = io.connect(location.origin+'/room/test');
    var user_count = 0;
    
    //background Audio Control
    var songs=
    [
    	{filename:'/bgmusic/tr1.mp3'},
    	{filename:'/bgmusic/tr2.mp3'},
    	{filename:'/bgmusic/tr3.mp3'}
    ];
    var randomTrack = Math.floor(Math.random()*songs.length) + 1;
    var currentTr = randomTrack;
    var song = songs[randomTrack];
   // var loc = document.querySelector('source').src = song.filename;
    
    var bgPlayer = document.getElementById('bgplayer');
    
    //backgound interface controller
    var ctrl = document.getElementById('playerControl');
    var ctrl2 = document.getElementById('prevControl');
    var ctrl3 = document.getElementById('nextControl');
    
    var play = document.getElementById('play');
    var pause = document.getElementById('pause');
    var prev = document.getElementById('prev');
    var next = document.getElementById('next');
    
    bgPlayer.addEventListener("ended", function(){
    if(currentTr < songs.length){
	    bgPlayer.src = "/bgmusic/tr" + (currentTr + 1) +".mp3";}
	    bgPlayer.play();
    })
    function toggleAudioImage(){
	    if (play.style.display ==='none'){
		    play.style.display = 'inline';
		    pause.style.display = 'none';
		    prev.style.display = 'inline';
		    next.style.display = 'inline';
	    }
	    else{
		    play.style.display = 'none';
		    pause.style.display = 'inline';
		    prev.style.display = 'inline';
		    next.style.display = 'inline';
	    }
    }

    // play,pause controller
    ctrl.onclick = function(){
	    if (bgPlayer.paused){
		    bgPlayer.play();}
		else{
		    bgPlayer.pause();}
	    
	    toggleAudioImage(); 
	    return false;
    };
    
    //prev control
    ctrl2.onclick = function(){
	    if (currentTr > 1)
	    {
	        currentTr--;
	        bgPlayer.src = '/bgmusic/tr' + (currentTr) + '.mp3';
	    }
	    bgPlayer.play();
	    return false;
    };
    
    //next control
    ctrl3.onclick = function(){
	    if (currentTr < songs.length)
	    {
	        currentTr++;
	        bgPlayer.src = '/bgmusic/tr' + (currentTr) + '.mp3';
	    }
		bgPlayer.play();
	    return false;
    };
    
    //Join game
    socket.emit('join');
    
    //read players number
    socket.on('count', function(count){
      user_count=count;
      $('span#count').text(user_count);
    }); 
    
    // read answer from server and start game
    socket.on('answer', function(answer){
      $('span#answer').text(answer);
    });    
    
    // read status from server
    socket.on('status', function(status){
      $('span#status').text(status);
    });    
    
    // read timer from server
    socket.on('timer', function(timer){
      if(timer == -1){
          $('span#status').text();
      }else{
          $('span#timer').text('timer left: ' + timer);   
      }
    });   
    
    
    //Emit messages what user enter
    $('form').submit(function(){
      socket.emit('chat', $('#msg').val());
      $('#msg').val('');
      return false;
    });
    
    //This code will post user messages on div#message box and automatically scrolling down when new messages are added
    
    socket.on('chat', function(msg){
      $('ul#list').append($('<li>').text(socket.id+': '+msg));
      //$('#messages').scrollTop($('#messages')[0].scrollHeight);
    });
    
    $( window ).unload(function() {
      socket.emit('leave');
      return true;
    });
});