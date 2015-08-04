$(function () {
    $("form#login_form").on("submit", function (event) {
        $("div.valimsg").text("");
        if ($("input#username").val() == "") {
            $("div#namemsg").text("username cannot be empty");
            event.preventDefault();
            return;
        }
        if ($("input#password").val() == "") {
            $("div#pwdmsg").text("password cannot be empty");
            event.preventDefault();
            return;
        }
    });

    $("form#signup_form").on("submit", function (event) {
        $("div.valimsg").text("");
        if ($("input#username").val() == "") {
            $("div#namemsg").text("username cannot be empty");
            event.preventDefault();
            return;
        }
        if ($("input#password").val() == "") {
            $("div#pwdmsg").text("password cannot be empty");
            event.preventDefault();
            return;
        }
        if ($("input#password").val() != $("input#re_password").val()) {
            document.getElementById("password").style.borderColor = "#E34234";
            document.getElementById("re_password").style.borderColor = "#E34234";
            alert("Password not match!");
            event.preventDefault();
            return;
        }
        //alert("you!");
        //event.preventDefault();
    });
});