$(function(){
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