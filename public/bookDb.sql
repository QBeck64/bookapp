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