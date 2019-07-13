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

  // Insert ISBN number to data base, if possible
  inserIsbn(isbn, userId, function (err, result) {
    
  });
}

function inserIsbn(isbn, userId, callback) {
  var sql = 'INSERT INTO isbn(isbn, user_id, isbn_user) VALUES ($1, $2, $3) RETURNING id';
  var isbn_user = isbn + userId;
  var params = [isbn, userId, isbn_user];
  pool.query(sql, params, function (err, result) {
    if (err) {
      console.log(err);
    } 
    console.log(result.rows[0].id);
    callback(null, result);
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

