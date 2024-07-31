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
  console.log(`Initializing user with ID: ${userId}`);
  if (!users[userId]) {
    users[userId] = {
      userId: userId,
      cryptoCoins: 0,
      businesses: {},
      upgrades: [],
      incomeMultiplier: 1,
      lastActive: Date.now(),
      prestigePoints: 0,
      achievements: []
    };
    console.log(`Created new user:`, users[userId]);
  } else {
    console.log(`User already exists:`, users[userId]);
  }
  return users[userId];
}

function updateUser(userId) {
  console.log(`Updating user with ID: ${userId}`);
  const user = users[userId];
  if (!user) {
    console.error(`User not found for ID: ${userId}`);
    return null;
  }

  const now = Date.now();
  const offlineTime = (now - user.lastActive) / 1000; // seconds
  const offlineEarnings = calculateOfflineEarnings(user, offlineTime);
  user.cryptoCoins += offlineEarnings;
  user.lastActive = now;

  console.log(`Updated user data:`, user);
  console.log(`Offline earnings: ${offlineEarnings}`);
  return user;
}

function clickCoin(userId) {
  console.log(`Processing click for user ${userId}`);
  const user = users[userId];
  if (!user) {
    console.error(`User not found for ID: ${userId}`);
    return null;
  }

  const clickPower = calculateClickPower(user);
  user.cryptoCoins += clickPower;
  console.log(`Click processed. Coins added: ${clickPower}. New total: ${user.cryptoCoins}`);
  return user;
}

function buyBusiness(userId, businessType) {
  console.log(`Buying business for user ${userId}: ${businessType}`);
  const user = users[userId];
  if (!user) {
    console.error(`User not found for ID: ${userId}`);
    return null;
  }

  const currentCount = user.businesses[businessType] || 0;
  const cost = calculateBusinessCost(businessType, currentCount);

  if (user.cryptoCoins < cost) {
    console.log(`Not enough coins. Required: ${cost}, Available: ${user.cryptoCoins}`);
    return user;
  }

  user.cryptoCoins -= cost;
  user.businesses[businessType] = (user.businesses[businessType] || 0) + 1;

  console.log(`Business purchased. Updated user data:`, user);
  return user;
}

function buyUpgrade(userId, upgradeId) {
  console.log(`Buying upgrade for user ${userId}: ${upgradeId}`);
  const user = users[userId];
  if (!user) {
    console.error(`User not found for ID: ${userId}`);
    return null;
  }

  const upgrade = UPGRADES[upgradeId];
  if (user.cryptoCoins < upgrade.cost || user.upgrades.includes(upgradeId)) {
    console.log(`Unable to buy upgrade. Coins: ${user.cryptoCoins}, Cost: ${upgrade.cost}, Already owned: ${user.upgrades.includes(upgradeId)}`);
    return user;
  }

  user.cryptoCoins -= upgrade.cost;
  user.upgrades.push(upgradeId);
  user.incomeMultiplier *= upgrade.effect;

  console.log(`Upgrade purchased. Updated user data:`, user);
  return user;
}

function prestige(userId) {
  console.log(`Processing prestige for user ${userId}`);
  const user = users[userId];
  if (!user || user.cryptoCoins < PRESTIGE_COST) {
    console.log(`Unable to prestige. User exists: ${!!user}, Coins: ${user ? user.cryptoCoins : 'N/A'}`);
    return null;
  }

  const prestigePoints = Math.floor(Math.log10(user.cryptoCoins / PRESTIGE_COST));
  user.cryptoCoins = 0;
  user.businesses = {};
  user.upgrades = [];
  user.prestigePoints += prestigePoints;
  user.incomeMultiplier = 1 + user.prestigePoints * 0.1; // 10% boost per prestige point

  console.log(`Prestige processed. New prestige points: ${user.prestigePoints}`);
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

function calculateClickPower(user) {
  let clickPower = 1;
  if (user.upgrades.includes('clickUpgrade')) {
    clickPower *= UPGRADES.clickUpgrade.effect;
  }
  return clickPower;
}

module.exports = {
  initUser,
  updateUser,
  clickCoin,
  buyBusiness,
  buyUpgrade,
  prestige,
  calculateIncome,
  calculateBusinessCost,
  BUSINESSES,
  UPGRADES
};