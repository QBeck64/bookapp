$(document).ready(function () {
    // Onload, verify express session, if invalid, require login
    $.post('/verifySession', function (result) {
        if (result && result.success) {
            console.log("Successful Login");
        } else {
            location.replace("bookLogin.html#");
        }
    });

    $("#book-search").on("submit", function (event) {
        event.preventDefault();
        var search = $("#search-string").val();

        var url = '';
        var isbn = '';
        var img = '';
        var title = '';
        var author = '';
        var description = '';
        var categories = '';
            

            $.get("https://www.googleapis.com/books/v1/volumes?q=" + search, function (response) {
                for (i = 0; i < response.items.length; i++)
                {
                    // Make sure the book has a identifier, otherwise don't list it
                    if (response.items[i].volumeInfo.industryIdentifiers != null) {
                        // Verify that the identifier is an ISBN number
                        if (!isNaN(response.items[i].volumeInfo.industryIdentifiers[0].identifier)) {

                            let message = '<tr>';
                            title = response.items[i].volumeInfo.title;
                            url = response.items[i].volumeInfo.imageLinks.thumbnail;
                            img = '<img id="img' + i + '" src="' + url + '">';
                            author = response.items[i].volumeInfo.authors;
                            description = response.items[i].volumeInfo.description;
                            isbn = response.items[i].volumeInfo.industryIdentifiers[0].identifier;
                            categories = response.items[i].volumeInfo.categories;

                            message += '<td><button class="btn btn-primary store-info" data-isbn="' + isbn + '" data-title="' + title + '" data-author="' + author + '" data-categories="' + categories + '">Collect</button></td>';
                            message += '<td>' + title + '</td>';
                            message += '<td>By: ' + author + '</td>';
                            message += '<td>' + isbn + '</td>';
                            message += '<td>' + description + '</td>';
                            message += '<td>' + img + '</td>';
                            message += '</tr>';

                            $("#results-table").append(message); 
                        }
                    }  
                    }
                console.log(response);
            });
    });

    // Onclick Button, query isbn, then add data to database
    $(document).on("click", ".store-info", function () {
        const isbn = $(this).data("isbn");
        const title = $(this).data("title");
        const authors = $(this).data("author");
        const categories = $(this).data("categories");

        var params = {
            isbn: isbn,
            title: title,
            authors: authors,
            categories: categories
        };
        // Send data to index to then be filtered and added to the database
        $.post('/collect', params, function (result) {
            if (result && result.success) {
                console.log("Book Successfully added to collection");
            } else {
                alert("This title is already in your collection");
            }
        });


    });











    // Database call fucntions
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