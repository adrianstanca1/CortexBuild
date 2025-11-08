import express from 'express';

const app = express();
const port = 3001;

app.get('/', (req, res) => {
  res.send('Hello from CortexBuild Server!');
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});