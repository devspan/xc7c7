import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaBitcoin, FaArrowUp, FaStore, FaStar, FaMicrochip, FaServer, FaBuilding, FaExchangeAlt, FaShoppingCart, FaLayerGroup } from 'react-icons/fa';

const API_BASE_URL = 'http://localhost:3000/api';

const BUSINESSES = {
  gpuMiner: { name: "GPU Miner", icon: FaMicrochip, baseCost: 10, baseIncome: 0.1 },
  asicFarm: { name: "ASIC Farm", icon: FaServer, baseCost: 100, baseIncome: 1 },
  blockchainStartup: { name: "Blockchain Startup", icon: FaBuilding, baseCost: 1000, baseIncome: 10 },
  cryptoExchange: { name: "Crypto Exchange", icon: FaExchangeAlt, baseCost: 10000, baseIncome: 100 },
  nftMarketplace: { name: "NFT Marketplace", icon: FaShoppingCart, baseCost: 100000, baseIncome: 1000 },
  defiPlatform: { name: "DeFi Platform", icon: FaLayerGroup, baseCost: 1000000, baseIncome: 10000 }
};

const UPGRADES = {
  fasterInternet: { name: "Faster Internet", icon: FaStar, cost: 1000, effect: 1.1 },
  betterCooling: { name: "Better Cooling", icon: FaStar, cost: 5000, effect: 1.2 },
  aiOptimization: { name: "AI Optimization", icon: FaStar, cost: 10000, effect: 1.5 },
  clickUpgrade: { name: "Click Power", icon: FaStar, cost: 500, effect: 2 },
};

function Game() {
  const [user, setUser] = useState(null);
  const [clickPower, setClickPower] = useState(1);
  const [activeTab, setActiveTab] = useState('businesses');
  const [countdown, setCountdown] = useState(null);

  useEffect(() => {
    const tgApp = window.Telegram.WebApp;
    tgApp.ready();
    const userId = tgApp.initDataUnsafe?.user?.id.toString() || '123';
    axios.post(`${API_BASE_URL}/user/init`, { userId })
      .then(response => setUser(response.data));

    tgApp.BackButton.show();
    tgApp.BackButton.onClick(() => {
      tgApp.close();
    });

    return () => {
      tgApp.BackButton.hide();
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (user) {
        const userId = window.Telegram.WebApp.initDataUnsafe?.user?.id.toString() || '123';
        axios.post(`${API_BASE_URL}/user/update`, { userId })
          .then(response => setUser(response.data));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    if (user && user.cryptoCoins >= 1e6) {
      const timestamp = new Date().getTime() + 24 * 60 * 60 * 1000;
      setCountdown(timestamp);
    }
  }, [user]);

  const handleClick = () => {
    const userId = window.Telegram.WebApp.initDataUnsafe?.user?.id.toString() || '123';
    axios.post(`${API_BASE_URL}/user/click`, { userId, clickPower })
      .then(response => setUser(response.data));
  };

  const buyBusiness = (businessType) => {
    const userId = window.Telegram.WebApp.initDataUnsafe?.user?.id.toString() || '123';
    axios.post(`${API_BASE_URL}/user/buy-business`, { userId, businessType })
      .then(response => setUser(response.data));
  };

  const buyUpgrade = (upgradeId) => {
    const userId = window.Telegram.WebApp.initDataUnsafe?.user?.id.toString() || '123';
    axios.post(`${API_BASE_URL}/user/buy-upgrade`, { userId, upgradeId })
      .then(response => {
        setUser(response.data);
        if (upgradeId === 'clickUpgrade') {
          setClickPower(prevPower => prevPower * UPGRADES.clickUpgrade.effect);
        }
      });
  };

  const prestige = () => {
    const userId = window.Telegram.WebApp.initDataUnsafe?.user?.id.toString() || '123';
    axios.post(`${API_BASE_URL}/user/prestige`, { userId })
      .then(response => setUser(response.data));
  };

  if (!user) return <div className="text-center mt-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-700 text-white">
      <div className="max-w-sm mx-auto p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">Crypto Capitalist</h1>
            <div className="text-sm">Prestige Points: {user.prestigePoints || 0}</div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold">{user.cryptoCoins.toFixed(2)}</div>
            <div className="text-sm text-green-500">{calculateIncome(user).toFixed(2)} /s</div>
          </div>
        </div>
        <div className="relative mb-4">
          <button 
            className="btn btn-circle btn-primary btn-lg absolute left-1/2 transform -translate-x-1/2"
            onClick={handleClick}
          >
            <FaBitcoin className="text-2xl" />
          </button>
          <div className="mt-16">
            <progress className="progress progress-primary w-full" value={user.cryptoCoins} max={1e6}></progress>
          </div>
        </div>
        {countdown && (
          <div className="mb-4">
            <div className="countdown font-mono text-center text-4xl">
              <span style={{ "--value": Math.floor((countdown - Date.now()) / 1000) }}></span>s
            </div>
          </div>
        )}
        <div className="mb-4">
          <div className="btm-nav">
            <button 
              className={`${activeTab === 'businesses' ? 'active' : ''}`}
              onClick={() => setActiveTab('businesses')}
            >
              <FaStore className="text-xl" />
              <span className="btm-nav-label">Businesses</span>
            </button>
            <button 
              className={`${activeTab === 'upgrades' ? 'active' : ''}`}
              onClick={() => setActiveTab('upgrades')}
            >
              <FaStar className="text-xl" />
              <span className="btm-nav-label">Upgrades</span>
            </button>
          </div>
        </div>
        {activeTab === 'businesses' && (
          <div className="grid grid-cols-4 gap-2">
            {Object.entries(BUSINESSES).map(([type, business]) => (
              <div key={type} className="flex flex-col items-center">
                <button 
                  className="btn btn-ghost btn-sm text-4xl"
                  onClick={() => buyBusiness(type)}
                  disabled={user.cryptoCoins < calculateBusinessCost(type, user.businesses[type] || 0)}
                >
                  <business.icon />
                </button>
                <div className="text-xs mt-1">
                  {user.businesses[type] || 0}
                </div>
              </div>
            ))}
          </div>
        )}
        {activeTab === 'upgrades' && (
          <div className="grid grid-cols-4 gap-2">
            {Object.entries(UPGRADES).map(([id, upgrade]) => (
              <div key={id} className="flex flex-col items-center">
                <button 
                  className="btn btn-ghost btn-sm text-4xl"
                  onClick={() => buyUpgrade(id)}
                  disabled={user.cryptoCoins < upgrade.cost || user.upgrades.includes(id)}
                >
                  <upgrade.icon />
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="text-center mt-4">
          <button 
            className="btn btn-error btn-sm"
            onClick={prestige}
            disabled={user.cryptoCoins < 1e6}
          >
            Prestige <FaArrowUp className="ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
}

function calculateBusinessCost(businessType, currentCount) {
  return Math.floor(BUSINESSES[businessType].baseCost * Math.pow(1.15, currentCount));
}

function calculateIncome(user) {
  let totalIncome = 0;
  for (const [businessType, count] of Object.entries(user.businesses)) {
    totalIncome += BUSINESSES[businessType].baseIncome * count;
  }
  return totalIncome * user.incomeMultiplier * (1 + (user.prestigePoints || 0) * 0.1);
}

export default Game;