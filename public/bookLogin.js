$(document).ready(function () {
    $('.message a').click(function () {
        $('form').animate({ height: "toggle", opacity: "toggle" }, "slow");
    });

    $('#loginBtn').click(function () {
        var username = $('#loginName').val();
        var password = $('#loginPsw').val();

        var params = {
            username: username,
            password: password
        };
        $.post('/login', params, function (result) {
            if (result && result.success) {
                location.replace("bookCollection.html#");
            } else {
                alert("nope");
            }
        });
    });

    $('#createBtn').click(function () {
        var username = $('#createName').val();
        var password = $('#createPsw').val();
        var verifyPsw = $('#verifyPsw').val();

        // Verify passwords match
        if (username != "" && password != "") {
            if (password == verifyPsw) {
                var params = {
                    username: username,
                    password: password
                };

                $.post('/create', params, function (result) {
                    if (result && result.success) {
                        alert("You have successfully created an account!");
                    } else {
                        alert("The username may already be in use or your passwords did not match");
                    }
                });
            }
        }
    });
})