// Backend: src/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { bot } = require('./botCommands');
const { initUser, updateUser, buyBusiness, buyUpgrade, clickCoin, prestige } = require('./gameLogic');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/user/init', (req, res) => {
  const { userId } = req.body;
  res.json(initUser(userId));
});

app.post('/api/user/update', (req, res) => {
  const { userId } = req.body;
  res.json(updateUser(userId));
});

app.post('/api/user/buy-business', (req, res) => {
  const { userId, businessType } = req.body;
  res.json(buyBusiness(userId, businessType));
});

app.post('/api/user/buy-upgrade', (req, res) => {
  const { userId, upgradeId } = req.body;
  res.json(buyUpgrade(userId, upgradeId));
});

app.post('/api/user/click', (req, res) => {
  const { userId } = req.body;
  res.json(clickCoin(userId));
});

app.post('/api/user/prestige', (req, res) => {
  const { userId } = req.body;
  res.json(prestige(userId));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  bot.launch();
  console.log('Telegram bot started');
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));