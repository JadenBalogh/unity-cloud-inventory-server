import express from 'express';
import cors from 'cors';
import mysql from 'mysql2';
import dotenv from 'dotenv';

// dotenv setup
dotenv.config();

// express setup
const port = process.env.PORT;
const app = express();
app.use(cors());
app.use(express.json());

// database connection setup
function getPool() {
  return mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_DATABASE,
  });
}

function printResults(err, results) {
  if (err) {
    console.log(err);
  } else {
    console.log(results);
  }
}

// setup express routes
app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/get-items', (req, res) => {
  getPool().query('SELECT * FROM item', (err, results) => {
    printResults(err, results);
    if (err) {
      res.send(err);
    } else {
      let output = { items: results };
      res.send(output);
    }
  });
});

app.post('/add-item', (req, res) => {
  getPool().query('INSERT INTO item (item_name) VALUES (?)', [[req.body.name]], printResults);
  res.end();
});

app.get('/reset-items', (req, res) => {
  getPool().query('DROP TABLE IF EXISTS item', printResults);
  getPool().query('CREATE TABLE item(id INT AUTO_INCREMENT PRIMARY KEY, item_name VARCHAR(50) NOT NULL)', printResults);
  res.end();
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
