$(function() {
    // Handler for .ready() called.
    //var socket = io('/test');
    var socket = io();
    //alert(room);
    //var socket = io.connect(location.origin+'/room/test');
    var user_count = 0;
    
    //Join game
    socket.emit('join');
    
    //read players number
    socket.on('count', function(count){
      user_count = count;
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
      $('ul#list').append($('<li>').text(msg));
      //$('#messages').scrollTop($('#messages')[0].scrollHeight);
    });
    
    $( window ).unload(function() {
      socket.emit('leave');
      return true;
    });
});