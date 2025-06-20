const express = require('express');
const cors = require('cors');
const fs = require('fs');
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

let gameState = {
  health: 100,
  keys: [],
  location: 'Central Hub',
  gameTime: 0,
  visitedLocations: ['Central Hub'],
  score: 0,
  startTime: Date.now(),
  timeEffects: {},
  answers: {},
  timeduration: 10
};

app.get('/api/state', (req, res) => {
  res.json(gameState);
});

app.post('/api/state', (req, res) => {
  gameState = { ...gameState, ...req.body };
  res.json({ success: true });
});

app.post('/api/reset', (req, res) => {
  gameState = JSON.parse(fs.readFileSync('./data/initialState.json', 'utf-8'));
  res.json({ success: true, state: gameState });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
