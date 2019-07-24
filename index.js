const express = require('express')
const path = require('path')
const session = require('express-session');
const passwordHash = require('password-hash');
const { Pool } = require("pg");
const PORT = process.env.PORT || 5000

const connectionString = process.env.DATABASE_URL || "postgres://hbwvkpmeewtkex:c90ff58420822e29398ba2dc0beb050008e4c2df1d1239cc67bd1f95b49bf99c@ec2-174-129-227-128.compute-1.amazonaws.com:5432/d6utdui5pkf1i3?ssl=true";
const pool = new Pool({ connectionString: connectionString });

var app = express();
app.use(session({
  secret: 'my-super-secret-secret!',
  resave: false,
  saveUninitialized: true,
  name: 'Our Name'
}));

app.use(express.static(path.join(__dirname, "public")));
//This is for using post values
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Login & Create Accounts
app.post('/login', handleLogin);
app.post('/create', handleCreate);

// Collect Book
app.post('/collect', handleCollect);

// Select contents
app.post('/getBooks', retrieveBooks);
app.post('/getAuthors', retrieveAuthors);
app.post('/selectAuthor', findAuthor);
app.post('/getCategories', retrieveCategories);
app.post('/selectCategory', findCategory);

//Varify Session Id exists
app.post('/verifySession', verifySession);

app.listen(PORT, function () {
  console.log("Server listening on port" + PORT);
});

function verifySession(request, response) {
  var result = { success: false };
  if (request.session.username) {
    console.log(request.session.username);
    result = { success: true };
  }
  response.json(result);
}

function handleCollect(request, response) {
  const isbn = request.body.isbn;
  const title = request.body.title;
  const authors = request.body.authors;
  const categories = request.body.categories;
  const userId = request.session.username;
  var isbnId = "";

  // Insert ISBN number to data base, if possible
  insertIsbn(isbn, userId, function (err, result) {
    if (result) {
      isbnId = result.rows[0].id;
      console.log(isbnId);
    } else {
      result = { success: false };
      response.json(result);
    }

    if (isbnId != "") {
      insertBook(isbnId, title);
      //Insert author(s), then return row id's of insert authors
      insertAuthors(isbnId, authors);

      // Insert Categories
      insertCategories(isbnId, categories);

      result = { success: true };
      response.json(result);
    }
  });
}

function retrieveBooks(request, response) {
  const userId = request.session.username;

  selectBooks(userId, function(err, result) {
    if (result) {
      response.json(result);
    }
  });
}

function selectBooks(userId, callback) {
  var sql = 'SELECT isbn FROM isbn WHERE user_id=$1';
  var params = [userId];
  pool.query(sql, params, function (err, result) {
    if (err) {
      console.log("Uh-oh, something went wrong getting books");
    }
    callback(null, result);
  });
}

function retrieveAuthors(request, response) {
  const userId = request.session.username;

  selectAuthors(userId, function (err, result) {
    if (result) {
      response.json(result);
    }
  });
}

function selectAuthors(userId, callback) {
  var sql = 'SELECT DISTINCT authors.id, authors.name FROM authors INNER JOIN isbn_authors ON authors.id = isbn_authors.authors_id INNER JOIN isbn ON isbn.id=isbn_authors.isbn_id WHERE isbn.user_id=$1 ORDER BY authors.name ASC';
  var params = [userId];
  pool.query(sql, params, function (err, result) {
    if (err) {
      console.log("Uh-Oh, something went wrong with authors!");
    }
    callback(null, result);
  });
}

function findAuthor(request, response) {
  const authorId = request.body.authorId;
  const userId = request.session.username;
  getAuthor(authorId, userId, function (err, result) {
    if (result) {
      response.json(result);
    }
  });
}

function getAuthor(authorId, userId, callback) {
  var sql = 'SELECT isbn FROM isbn INNER JOIN isbn_authors ON isbn_authors.authors_id=$1 WHERE isbn_authors.isbn_id=isbn.id AND isbn.user_id=$2';
  var params = [authorId, userId];
  pool.query(sql, params, function (err, result) {
    if (err) {
      console.log("Uh-Oh");
    }
    console.log(result);
    callback(null, result);
  });
}

function retrieveCategories(request, response) {
  const userId = request.session.username;

  selectCategories(userId, function (err, result) {
    if (result) {
      response.json(result);
    }
  });
}

function selectCategories(userId, callback) {
  var sql = 'SELECT DISTINCT categories.id, categories.name FROM categories INNER JOIN isbn_categories ON categories.id = isbn_categories.categories_id INNER JOIN isbn ON isbn.id=isbn_categories.isbn_id WHERE isbn.user_id=$1 ORDER BY categories.name ASC';
  var params = [userId];
  pool.query(sql, params, function (err, result) {
    if (err) {
      console.log("Uh-Oh, something went wrong with categories!");
    }
    callback(null, result);
  });
}

function findCategory(request, response) {
  const categoryId = request.body.categoryId;
  const userId = request.session.username;
  getCategory(categoryId, userId, function (err, result) {
    if (result) {
      response.json(result);
    }
  });
}

function getCategory(categoryId, userId, callback) {
  var sql = 'SELECT isbn FROM isbn INNER JOIN isbn_categories ON isbn_categories.categories_id=$1 WHERE isbn_categories.isbn_id=isbn.id AND isbn.user_id=$2';
  var params = [categoryId, userId];
  pool.query(sql, params, function (err, result) {
    if (err) {
      console.log("Uh-Oh");
    }
    callback(null, result);
  });
}

function insertIsbn(isbn, userId, callback) {
  var sql = 'INSERT INTO isbn(isbn, user_id, isbn_user) VALUES ($1, $2, $3) RETURNING id';
  var isbn_user = isbn + userId;
  var params = [isbn, userId, isbn_user];
  pool.query(sql, params, function (err, result) {
    if (err) {
      console.log(err);
      console.log(result);
    } 
    callback(null, result);
  });
}

function insertBook(isbnId, title) {
  var sql = 'INSERT INTO books(name, isbn_id) VALUES ($1, $2)';
  var params = [title, isbnId];
  pool.query(sql, params, function (err, result) {
    if (err) {
      console.log(err);
    } 
    console.log(result);
  });
}

function insertAuthors(isbnId, authors) {
  var sql = 'INSERT INTO authors(name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = authors.name RETURNING id';
  var params = [authors];
  pool.query(sql, params, function (err, result) {
    if (err) {
      console.log("Author already exists");
    } else {
      console.log(result.rows[0].id);
      // Add isbnId and authors_id to relational table
      insertIsbnAuthors(isbnId, result.rows[0].id);
    }
   
  });
}

function insertIsbnAuthors(isbnId, authorsId) {
  var sql = 'INSERT INTO isbn_authors(isbn_id, authors_id) VALUES ($1, $2)';
  var params = [isbnId, authorsId];
  pool.query(sql, params, function (err, result) {
    if (err) {
      console.log("Pair already exists");
    }
   
  });
}

function insertCategories(isbnId, categories) {
  var sql = 'INSERT INTO categories(name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = categories.name RETURNING id';
  var params = [categories];
  pool.query(sql, params, function (err, result) {
    if (err) {
      console.log("Category already exists");
    } else {
      console.log(result.rows[0].id);
      // Add isbnId and authors_id to relational table
      insertIsbnCategories(isbnId, result.rows[0].id);
    }
   
  });
}

function insertIsbnCategories(isbnId, categoriesId) {
  var sql = 'INSERT INTO isbn_categories(isbn_id, categories_id) VALUES ($1, $2)';
  var params = [isbnId, categoriesId];
  pool.query(sql, params, function (err, result) {
    if (err) {
      console.log("Pair already exists");
    }
   
  });
}

// Callback on /login
function handleLogin(request, response) {
  console.log("step1");
  var result = { success: false };

  const username = request.body.username;
  const password = request.body.password;
  console.log(password);
  getUser(username, function (err, result) {
    console.log(result.rowCount);
    if (result.rowCount > 0) {
      if (passwordHash.verify(password, result.rows[0].password)) {

        request.session.username = result.rows[0].id;
        console.log(request.session.username);
        result = { success: true };
      }
    }
    response.json(result);
  });
}

function getUser(username, callback) {
  var sql = "SELECT * FROM users WHERE username = $1";
  var params = [username];
  pool.query(sql, params, function (err, result) {
    if (err) {
      console.log(err);
    }
    //      console.log(result);
    callback(null, result);
  });
}
// End login functions

// Insert New Login credentials
function handleCreate(request, response) {
  var result = { success: false };
  const username = request.body.username;
  const password = passwordHash.generate(request.body.password);

  createUser(username, password, function (err, result) {
    result = { success: true };
    console.log(result.success);
    response.json(result);
  });
}

function createUser(username, password, callback) {
  var sql = 'INSERT INTO users(username, password) VALUES ($1, $2)';
  var params = [username, password];
  pool.query(sql, params, function (err, result) {
    if (err) {
      console.log(err);
    }
    callback(null, result);
  });
}

// express()
//   .use(express.static(path.join(__dirname, 'public')))
//   .set('views', path.join(__dirname, 'views'))
//   .set('view engine', 'ejs')
//   .get('/', (req, res) => res.render('pages/index'))
//   .get('/getBooks', function (req, res) {
//     getBooksFromDb(function (err, result) {
//       res.status(200).json(result);
//     })
//   })

//   .get('/getAuthors', function (req, res) {
//     getAuthorsFromDb(function (err, result) {
//       res.status(200).json(result);
//     })
//   })

//   .get('/getCategories', function (req, res) {
//     getCategoriesFromDb(function (err, result) {
//       res.status(200).json(result);
//     })
//   })
//   .listen(PORT, () => console.log(`Listening on ${PORT}`))

function logRequest(request, response, next) {
  console.log("Received a request for: " + request.url);
  next();
}

