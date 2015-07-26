/**
 * Created by Yang on 15/7/26.
 */
$(function(){
    $("form#signup_form").on("submit", function(event){
        $("div.valimsg").text("");
        if($("input#password").val() != $("input#re_password").val()){
            document.getElementById("password").style.borderColor = "#E34234";
            document.getElementById("re_password").style.borderColor = "#E34234";
            alert("Password not match!");
            event.preventDefault();
            return;
        }
    });
});