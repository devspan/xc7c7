// Backend: src/gameLogic.js
const users = {};

const PRESTIGE_COST = 1e6; // 1 million coins to prestige

const BUSINESSES = {
  gpuMiner: { name: "GPU Miner", baseCost: 10, baseIncome: 0.1 },
  asicFarm: { name: "ASIC Farm", baseCost: 100, baseIncome: 1 },
  blockchainStartup: { name: "Blockchain Startup", baseCost: 1000, baseIncome: 10 },
  cryptoExchange: { name: "Crypto Exchange", baseCost: 10000, baseIncome: 100 },
  nftMarketplace: { name: "NFT Marketplace", baseCost: 100000, baseIncome: 1000 },
  defiPlatform: { name: "DeFi Platform", baseCost: 1000000, baseIncome: 10000 }
};

const UPGRADES = {
  fasterInternet: { name: "Faster Internet", cost: 1000, effect: 1.1 },
  betterCooling: { name: "Better Cooling", cost: 5000, effect: 1.2 },
  aiOptimization: { name: "AI Optimization", cost: 10000, effect: 1.5 },
  clickUpgrade: { name: "Click Power", cost: 500, effect: 2 },
};

function initUser(userId) {
  if (!users[userId]) {
    users[userId] = {
      cryptoCoins: 100,
      businesses: {},
      upgrades: [],
      incomeMultiplier: 1,
      lastActive: Date.now(),
      prestigePoints: 0
    };
  }
  return users[userId];
}

function updateUser(userId) {
  const user = users[userId];
  if (!user) return null;

  const now = Date.now();
  const offlineTime = (now - user.lastActive) / 1000; // seconds
  user.cryptoCoins += calculateOfflineEarnings(user, offlineTime);
  user.lastActive = now;

  return user;
}

function buyBusiness(userId, businessType) {
  const user = users[userId];
  if (!user) return null;

  const currentCount = user.businesses[businessType] || 0;
  const cost = calculateBusinessCost(businessType, currentCount);

  if (user.cryptoCoins < cost) {
    return user;
  }

  user.cryptoCoins -= cost;
  user.businesses[businessType] = currentCount + 1;

  return user;
}

function buyUpgrade(userId, upgradeId) {
  const user = users[userId];
  if (!user) return null;

  const cost = UPGRADES[upgradeId].cost;

  if (user.cryptoCoins < cost || user.upgrades.includes(upgradeId)) {
    return user;
  }

  user.cryptoCoins -= cost;
  user.upgrades.push(upgradeId);
  user.incomeMultiplier *= UPGRADES[upgradeId].effect;

  return user;
}

function clickCoin(userId) {
  const user = users[userId];
  if (!user) return null;

  const clickPower = calculateClickPower(user);
  user.cryptoCoins += clickPower;
  return user;
}

function calculateClickPower(user) {
  let clickPower = 1;
  if (user.upgrades.includes('clickUpgrade')) {
    clickPower *= UPGRADES.clickUpgrade.effect;
  }
  return clickPower;
}

function prestige(userId) {
  const user = users[userId];
  if (!user || user.cryptoCoins < PRESTIGE_COST) return null;

  const prestigePoints = Math.floor(Math.log10(user.cryptoCoins / PRESTIGE_COST));
  user.cryptoCoins = 0;
  user.businesses = {};
  user.upgrades = [];
  user.prestigePoints += prestigePoints;
  user.incomeMultiplier = 1 + user.prestigePoints * 0.1; // 10% boost per prestige point

  return user;
}

function calculateIncome(user) {
  let totalIncome = 0;
  for (const [businessType, count] of Object.entries(user.businesses)) {
    totalIncome += BUSINESSES[businessType].baseIncome * count;
  }
  return totalIncome * user.incomeMultiplier * (1 + user.prestigePoints * 0.1);
}

function calculateBusinessCost(businessType, currentCount) {
  return Math.floor(BUSINESSES[businessType].baseCost * Math.pow(1.15, currentCount));
}

function calculateOfflineEarnings(user, offlineTime) {
  return calculateIncome(user) * offlineTime;
}

function getStatus(userId) {
  const user = users[userId];
  if (!user) return 'Please start the game first with /start';

  let statusMessage = `💰 Coins: ${user.cryptoCoins.toFixed(2)}\n`;
  statusMessage += `💼 Businesses:\n`;
  for (const [businessType, count] of Object.entries(user.businesses)) {
    statusMessage += `  ${BUSINESSES[businessType].name}: ${count}\n`;
  }
  statusMessage += `🚀 Income per second: ${calculateIncome(user).toFixed(2)}`;
  statusMessage += `\n🏆 Prestige Points: ${user.prestigePoints}`;

  return statusMessage;
}

function getBusinesses() {
  let message = 'Available businesses:\n';
  for (const [type, business] of Object.entries(BUSINESSES)) {
    message += `${business.name} - Cost: ${business.baseCost} coins, Income: ${business.baseIncome}/s\n`;
  }
  return message;
}

function getUpgrades() {
  let message = 'Available upgrades:\n';
  for (const [id, upgrade] of Object.entries(UPGRADES)) {
    message += `${upgrade.name} - Cost: ${upgrade.cost} coins, Effect: ${(upgrade.effect - 1) * 100}% income boost\n`;
  }
  return message;
}

module.exports = {
  initUser,
  updateUser,
  buyBusiness,
  buyUpgrade,
  clickCoin,
  prestige,
  getStatus,
  getBusinesses,
  getUpgrades,
  calculateClickPower
};
