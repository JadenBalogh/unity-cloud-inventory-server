import express from 'express';
import mysql from 'mysql2';
import dotenv from 'dotenv';

// dotenv setup
dotenv.config();

// express setup
const app = express();
const port = 3000;

// database connection setup
const conn = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_DATABASE,
});

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/test', (req, res) => {
  res.send('You have reached Test!');
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
