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

    function validateForm() {
        var x = document.forms["signup_form"]["password"].value
        var y = document.forms["signup_form"]["re_password"].value;
        if (x != y) {
            alert("Not match");
            return false;
        }
    }

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
        alert("you!");
        //event.preventDefault();
    });
});