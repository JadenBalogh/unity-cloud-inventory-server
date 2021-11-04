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

let pool;

// database connection setup
function getPool() {
  if (!pool) {
    console.log("We didn't have a pool. Creating one!");
    pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_DATABASE,
    });
  }
  return pool;
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

app.get('/get-item', (req, res) => {
  getPool().query('SELECT * FROM item WHERE id = ?', [[req.query.itemId]], (err, results) => {
    printResults(err, results);
    if (err) {
      res.send(err);
    } else {
      let result = results.length > 0 ? results[0] : null;
      let output = { item: result };
      res.send(output);
    }
  });
});

app.get('/get-items', (req, res) => {
  getPool().query('SELECT * FROM item WHERE player_id = ?', [[req.query.playerId]], (err, results) => {
    printResults(err, results);
    if (err) {
      res.send(err);
    } else {
      let output = { items: results };
      res.send(output);
    }
  });
});

app.get('/get-items-by-type', (req, res) => {
  let playerId = req.query.playerId;
  let itemType = req.query.type;
  getPool().query('SELECT * FROM item WHERE player_id = ? AND item_type = ?', [playerId, itemType], (err, results) => {
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
  let playerId = req.body.playerId;
  let itemName = req.body.name;
  let itemType = req.body.type;
  let itemData = req.body.data;
  getPool().query(
    'INSERT INTO item (player_id, item_name, item_type, item_data) VALUES (?, ?, ?, ?)',
    [playerId, itemName, itemType, itemData],
    (err, results) => {
      printResults(err, results);
      if (err) {
        res.send(err);
      } else {
        getPool().query('SELECT * FROM item WHERE id = LAST_INSERT_ID()', (err, results) => {
          printResults(err, results);
          if (err) {
            res.send(err);
          } else {
            let result = results.length > 0 ? results[0] : null;
            let output = { item: result };
            res.send(output);
          }
        });
      }
    }
  );
});

app.post('/update-item', (req, res) => {
  let itemId = req.query.itemId;
  let playerId = req.body.playerId;
  let itemName = req.body.name;
  let itemType = req.body.type;
  let itemData = req.body.data;
  getPool().query(
    'UPDATE item SET player_id = ?, item_name = ?, item_type = ?, item_data = ? WHERE id = ?',
    [playerId, itemName, itemType, itemData, itemId],
    (err, results) => {
      printResults(err, results);
      if (err) {
        res.send(err);
      } else {
        getPool().query('SELECT * FROM item WHERE id = ?', [[req.query.itemId]], (err, results) => {
          printResults(err, results);
          if (err) {
            res.send(err);
          } else {
            let result = results.length > 0 ? results[0] : null;
            let output = { item: result };
            res.send(output);
          }
        });
      }
    }
  );
});

app.get('/remove-item', (req, res) => {
  getPool().query('DELETE FROM item WHERE id = ?', [req.query.itemId], (err, results) => {
    printResults(err, results);
    if (err) {
      res.send(err);
    } else {
      res.end();
    }
  });
});

app.get('/trade-item', (req, res) => {
  let itemId = req.query.itemId;
  let playerId = req.query.playerId;
  getPool().query('UPDATE item SET player_id = ? WHERE id = ?', [playerId, itemId], (err, results) => {
    printResults(err, results);
    if (err) {
      res.send(err);
    } else {
      res.end();
    }
  });
});

app.get('/reset-items', (req, res) => {
  getPool().query('DROP TABLE IF EXISTS item', (err, results) => {
    printResults(err, results);
    getPool().query(
      `CREATE TABLE item(
        id INT AUTO_INCREMENT PRIMARY KEY,
        player_id VARCHAR(50) NOT NULL,
        item_name VARCHAR(50) NOT NULL,
        item_type INT NOT NULL,
        item_data TEXT
      )`,
      printResults
    );
    res.end();
  });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
