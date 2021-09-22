import express from 'express';

const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/test', (req, res) => {
  res.send('You have reached Test!');
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
