CREATE DATABASE chatapp;

CREATE TABLE users(
    id SERIAL PRIMARY KEY,
    username VARCHAR(32) NOT NULL UNIQUE,
    password VARCHAR(32) NOT NULL
);

CREATE TABLE messages(
    id SERIAL PRIMARY KEY,
    message TEXT NOT NULL,
    user_id INT REFERENCES users(id) NOT NULL
);