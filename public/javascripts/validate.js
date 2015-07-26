$(function(){
  $("form#login_form").on("submit", function(event){
	$("div.valimsg").text("");
	if($("input#username").val() == ""){
		$("div#namemsg").text("username cannot be empty");
		event.preventDefault();
		return;
	}
	if($("input#password").val() == ""){
		$("div#pwdmsg").text("password cannot be empty");
		event.preventDefault();
		return;
	}
  });
	
  $("form#addform").on("submit", function(event){
	$("div.valimsg").text("");
	if($("input#firstname").val() == ""){
		$("div#firmsg").text("firstname cannot be empty");
		event.preventDefault();
		return;
	}
	if($("input#lastname").val() == ""){
		$("div#lamsg").text("lastname cannot be empty");
		event.preventDefault();
		return;
	}
	if($("input#email").val() == ""){
		$("div#emailmsg").text("Email cannot be empty");
		event.preventDefault();
		return;
	}
	//alert("you!");
	//event.preventDefault();
  });
});