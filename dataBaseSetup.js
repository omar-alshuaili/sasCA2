const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('users.db');
db.run('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, name TEXT, email TEXT, password TEXT)');
db.run('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', ['John', 'john@example.com', 'password123']);

