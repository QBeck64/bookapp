CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR NOT NULL UNIQUE,
    password VARCHAR NOT NULL
);

CREATE TABLE isbn (
    id SERIAL PRIMARY KEY,
    isbn bigint NOT NULL,
    user_id int NOT NULL REFERENCES users(id),
    isbn_user bigint NOT NULL
);

CREATE INDEX isbn_user 
ON isbn (isbn, user_id);

CREATE TABLE books (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    isbn_id int NOT NULL REFERENCES isbn(id)
);

CREATE TABLE authors (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL UNIQUE
);

CREATE TABLE isbn_authors (
    id SERIAL PRIMARY KEY, 
    isbn_id int NOT NULL REFERENCES isbn(id),
    authors_id int NOT NULL REFERENCES authors(id)
);

CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL UNIQUE
);

CREATE TABLE isbn_categories (
    id SERIAL PRIMARY KEY,
    isbn_id int NOT NULL REFERENCES isbn(id),
    categories_id int NOT NULL REFERENCES categories(id)
);

ALTER TABLE isbn
ALTER COLUMN isbn TYPE bigint;

-- SELECT authors.name, isbn.isbn, isbn.user_id FROM authors INNER JOIN isbn_authors ON authors.id = isbn_authors.authors_id INNER JOIN isbn ON isbn.id=isbn_authors.isbn_id WHERE isbn.user_id=1;
SELECT DISTINCT authors.id, authors.name FROM authors INNER JOIN isbn_authors ON authors.id = isbn_authors.authors_id INNER JOIN isbn ON isbn.id=isbn_authors.isbn_id WHERE isbn.user_id=1 ORDER BY authors.name ASC;
SELECT DISTINCT categories.id, categories.name FROM categories INNER JOIN isbn_categories ON categories.id = isbn_categories.categories_id INNER JOIN isbn ON isbn.id=isbn_categories.isbn_id WHERE isbn.user_id=1 ORDER BY categories.name ASC;

SELECT isbn.isbn FROM isbn INNER JOIN isbn_authors ON isbn_authors.authors_id=15 WHERE isbn_authors.isbn_id=isbn.id AND isbn.user_id=1;