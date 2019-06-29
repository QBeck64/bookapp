$(document).ready(function () {
    $("#getBooks").on("click", function () {
        $.get('/getBooks', {         
        }, function (data) {
                const books = data;
                for (var i = 0; i < books.length; i++) {
                    $("#books").append("<p>" + data[i].name + "</p>");
                }

        }, 'json'
        );
    });

    $("#getAuthors").on("click", function () {
        $.get('/getAuthors', {         
        }, function (data) {
                const authors = data;
                for (var i = 0; i < authors.length; i++) {
                    $("#authors").append("<p>" + data[i].name + "</p>");
                }

        }, 'json'
        );
    });

    $("#getCategories").on("click", function () {
        $.get('/getCategories', {         
        }, function (data) {
                const categories = data;
                for (var i = 0; i < categories.length; i++) {
                    $("#categories").append("<p>" + data[i].name + "</p>");
                }

        }, 'json'
        );
    });
})