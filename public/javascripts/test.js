$(function() {
    // Handler for .ready() called.
    //var socket = io('/test');
    //var socket = io();
    //alert(room);
    
    var room = $('div#room').text();
    var socket = io.connect(location.origin+'/room/'+room);
    var user_count = 0;
    
    //background Audio Control
    var songs=
    [
    	{filename:'/bgmusic/tr1.mp3'},
    	{filename:'/bgmusic/tr2.mp3'},
    	{filename:'/bgmusic/tr3.mp3'}
    ];
    var randomTrack = Math.floor(Math.random()*songs.length) + 1;
    var song = songs[randomTrack];
   // var loc = document.querySelector('source').src = song.filename;
    
    var bgPlayer = document.getElementById('bgplayer');
    var ctrl = document.getElementById('playerControl');
    var play = document.getElementById('play');
    var pause = document.getElementById('pause');
    var prev = document.getElementById('prev');
    var next = document.getElementById('next');
    
    bgPlayer.addEventListener("ended", function(){
	    bgPlayer.src = "/bgmusic/tr" + (randomTrack) +".mp3";
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

    ctrl.onclick = function(){
	    if (bgPlayer.paused){
	        //bgPlayer.src = '/bgmusic/tr' + randomTrack + '.mp3';
		    bgPlayer.play();
	    }
	    
	    else{
		    bgPlayer.pause();
	    }
	    
	    toggleAudioImage();
	    
	    return false;
    };
    //Join game
    var guest = $('div#infobox div#guest').text();
    var cookie = guest == 'true' ? 'guest' : $('div#infobox div#id').text()
    socket.emit('join', cookie);
    
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
    
    socket.on('info', function(msg){
      $('ul#list').append($('<li>').text('Sys: '+msg));
    }); 
    
    
    //Emit messages what user enter
    $('form').submit(function(){
      socket.emit('chat', $('#msg').val(), $('div#infobox div#nickname').text());
      $('#msg').val('');
      return false;
    });
    
    //This code will post user messages on div#message box and automatically scrolling down when new messages are added
    
    socket.on('chat', function(msg){
      $('ul#list').append($('<li>').text(msg));
      //$('#messages').scrollTop($('#messages')[0].scrollHeight);
    });
    
    $(window).unload(function() {
      socket.emit('leave');
      return true;
    });
});