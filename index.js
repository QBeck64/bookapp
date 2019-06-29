const express = require('express')
const path = require('path')
const { Pool } = require("pg");
const PORT = process.env.PORT || 5000

const connectionString = process.env.DATABASE_URL || "postgres://hbwvkpmeewtkex:c90ff58420822e29398ba2dc0beb050008e4c2df1d1239cc67bd1f95b49bf99c@ec2-174-129-227-128.compute-1.amazonaws.com:5432/d6utdui5pkf1i3?ssl=true";

const pool = new Pool({connectionString: connectionString});

express()
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .get('/getBooks', function (req, res) {
    getBooksFromDb(function (err, result) {
      res.status(200).json(result);
    })
  })

  .get('/getAuthors', function (req, res) {
    getAuthorsFromDb(function (err, result) {
      res.status(200).json(result);
    })
  })

  .get('/getCategories', function (req, res) {
    getCategoriesFromDb(function (err, result) {
      res.status(200).json(result);
    })
  })
  .listen(PORT, () => console.log(`Listening on ${PORT}`))
  
function getBooksFromDb(callback) {
  var sql = "SELECT * FROM books";
  pool.query(sql, function(err, result){
      if(err){ console.log(err); }
    callback(null, result.rows);
    console.log("Found DB result: " + JSON.stringify(result.rows));
  });
}
  
function getAuthorsFromDb(callback) {
  var sql = "SELECT * FROM authors";
  pool.query(sql, function(err, result){
      if(err){ console.log(err); }
    callback(null, result.rows);
    console.log("Found DB result: " + JSON.stringify(result.rows));
  });
}
  
function getCategoriesFromDb(callback) {
  var sql = "SELECT * FROM categories";
  pool.query(sql, function(err, result){
      if(err){ console.log(err); }
    callback(null, result.rows);
    console.log("Found DB result: " + JSON.stringify(result.rows));
  });
}
  
