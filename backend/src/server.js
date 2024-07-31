require('dotenv').config();
const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const { 
  initUser, 
  updateUser, 
  clickCoin, 
  buyBusiness, 
  buyUpgrade, 
  prestige, 
  BUSINESSES,
  UPGRADES
} = require('./gameLogic');

const app = express();

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());

// Middleware to verify Telegram Web App data
const verifyTelegramWebAppData = (req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    return next(); // Skip verification in development
  }

  const telegramInitData = req.headers['x-telegram-init-data'];
  if (!telegramInitData) {
    return res.status(401).json({ error: 'Unauthorized: No Telegram data provided' });
  }

  const secret = crypto.createHmac('sha256', 'WebAppData').update(process.env.BOT_TOKEN);
  const encoded = crypto.createHmac('sha256', secret.digest()).update(telegramInitData);
  const hash = encoded.digest('hex');
  
  if (req.headers['x-telegram-hash'] !== hash) {
    return res.status(401).json({ error: 'Unauthorized: Invalid Telegram data' });
  }

  next();
};

// Apply Telegram verification middleware to all routes
app.use(verifyTelegramWebAppData);

app.post('/api/user/init', (req, res) => {
  console.log('Received user init request with body:', req.body);
  const { userId, username, firstName, lastName } = req.body;
  
  if (!userId) {
    console.error('User initialization failed: No userId provided');
    return res.status(400).json({ error: 'userId is required' });
  }

  try {
    const userData = initUser(userId, { username, firstName, lastName });
    console.log('User initialized successfully:', userData);
    res.json(userData);
  } catch (error) {
    console.error('Error in user initialization:', error);
    res.status(500).json({ error: 'Failed to initialize user', details: error.message });
  }
});

app.post('/api/user/update', (req, res) => {
  console.log('Received user update request with body:', req.body);
  const { userId } = req.body;
  try {
    const updatedUser = updateUser(userId);
    if (updatedUser) {
      console.log('User updated successfully:', updatedUser);
      res.json(updatedUser);
    } else {
      console.error('User not found for update:', userId);
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user', details: error.message });
  }
});

app.post('/api/user/click', (req, res) => {
  console.log('Received click request with body:', req.body);
  const { userId } = req.body;
  try {
    const updatedUser = clickCoin(userId);
    if (updatedUser) {
      console.log('Click processed successfully:', updatedUser);
      res.json(updatedUser);
    } else {
      console.error('User not found for click:', userId);
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Error processing click:', error);
    res.status(500).json({ error: 'Failed to process click', details: error.message });
  }
});

app.post('/api/user/buy-business', (req, res) => {
  console.log('Received buy business request with body:', req.body);
  const { userId, businessType } = req.body;
  try {
    const updatedUser = buyBusiness(userId, businessType);
    if (updatedUser) {
      console.log('Business purchased successfully:', updatedUser);
      res.json(updatedUser);
    } else {
      console.error('User not found or insufficient funds for business purchase:', userId);
      res.status(404).json({ error: 'User not found or insufficient funds' });
    }
  } catch (error) {
    console.error('Error buying business:', error);
    res.status(500).json({ error: 'Failed to buy business', details: error.message });
  }
});

app.post('/api/user/buy-upgrade', (req, res) => {
  console.log('Received buy upgrade request with body:', req.body);
  const { userId, upgradeId } = req.body;
  try {
    const updatedUser = buyUpgrade(userId, upgradeId);
    if (updatedUser) {
      console.log('Upgrade purchased successfully:', updatedUser);
      res.json(updatedUser);
    } else {
      console.error('User not found or upgrade already purchased:', userId);
      res.status(404).json({ error: 'User not found or upgrade already purchased' });
    }
  } catch (error) {
    console.error('Error buying upgrade:', error);
    res.status(500).json({ error: 'Failed to buy upgrade', details: error.message });
  }
});

app.post('/api/user/prestige', (req, res) => {
  console.log('Received prestige request with body:', req.body);
  const { userId } = req.body;
  try {
    const updatedUser = prestige(userId);
    if (updatedUser) {
      console.log('Prestige processed successfully:', updatedUser);
      res.json(updatedUser);
    } else {
      console.error('User not found or insufficient coins for prestige:', userId);
      res.status(404).json({ error: 'User not found or insufficient coins for prestige' });
    }
  } catch (error) {
    console.error('Error processing prestige:', error);
    res.status(500).json({ error: 'Failed to process prestige', details: error.message });
  }
});

app.get('/api/game-data', (req, res) => {
  console.log('Received request for game data');
  res.json({ BUSINESSES, UPGRADES });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});