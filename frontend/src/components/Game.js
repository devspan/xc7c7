import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FaBitcoin, FaArrowUp, FaTrophy } from 'react-icons/fa';
import './Game.css';

const API_BASE_URL = 'http://localhost:3000/api';

function Game() {
  const [user, setUser] = useState(null);
  const [gameData, setGameData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [floatingTexts, setFloatingTexts] = useState([]);

  const fetchGameData = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/game-data`);
      setGameData(response.data);
    } catch (error) {
      console.error("Error fetching game data:", error);
      setError("Failed to fetch game data. Please refresh the page.");
    }
  }, []);

  const initializeUser = useCallback(async () => {
    try {
      const userId = '123'; // In a real app, get this from Telegram Mini App
      const response = await axios.post(`${API_BASE_URL}/user/init`, { userId });
      setUser(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error initializing user:", error);
      setError("Failed to initialize user. Please refresh the page.");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGameData();
    initializeUser();
  }, [fetchGameData, initializeUser]);

  const updateUser = useCallback(async () => {
    if (!user) return;
    try {
      const response = await axios.post(`${API_BASE_URL}/user/update`, { userId: user.userId });
      setUser(response.data);
    } catch (error) {
      console.error("Error updating user:", error);
    }
  }, [user]);

  useEffect(() => {
    const interval = setInterval(updateUser, 1000); // Update every second
    return () => clearInterval(interval);
  }, [updateUser]);

  const handleClick = useCallback(async (e) => {
    if (!user) return;
    try {
      const response = await axios.post(`${API_BASE_URL}/user/click`, { userId: user.userId });
      setUser(response.data);
      setFloatingTexts(prev => [...prev, {
        id: Date.now(),
        value: response.data.cryptoCoins - user.cryptoCoins,
        x: e.clientX,
        y: e.clientY
      }]);
    } catch (error) {
      console.error("Error processing click:", error);
    }
  }, [user]);

  const buyBusiness = useCallback(async (businessType) => {
    if (!user) return;
    try {
      const response = await axios.post(`${API_BASE_URL}/user/buy-business`, { userId: user.userId, businessType });
      setUser(response.data);
    } catch (error) {
      console.error("Error buying business:", error);
    }
  }, [user]);

  const buyUpgrade = useCallback(async (upgradeId) => {
    if (!user) return;
    try {
      const response = await axios.post(`${API_BASE_URL}/user/buy-upgrade`, { userId: user.userId, upgradeId });
      setUser(response.data);
    } catch (error) {
      console.error("Error buying upgrade:", error);
    }
  }, [user]);

  const prestige = useCallback(async () => {
    if (!user) return;
    try {
      const response = await axios.post(`${API_BASE_URL}/user/prestige`, { userId: user.userId });
      setUser(response.data);
    } catch (error) {
      console.error("Error processing prestige:", error);
    }
  }, [user]);

  if (loading) return <div>Loading... Please wait.</div>;
  if (error) return <div className="error-message">Error: {error}</div>;
  if (!user || !gameData) return <div>No game data available. Please refresh the page.</div>;

  return (
    <div className="game-container">
      <h1>Crypto Capitalist</h1>
      <div className="stats">
        <div>Coins: {user.cryptoCoins.toFixed(2)}</div>
        <div>Prestige Points: {user.prestigePoints || 0}</div>
        <div>Income: {user.incomeMultiplier.toFixed(2)} /s</div>
      </div>
      <button className="click-button" onClick={handleClick}>
        <FaBitcoin />
      </button>
      {floatingTexts.map(text => (
        <div 
          key={text.id} 
          className="floating-text" 
          style={{ 
            left: text.x, 
            top: text.y,
            position: 'absolute',
            animation: 'float-up 1s ease-out',
            pointerEvents: 'none'
          }}
        >
          +{text.value.toFixed(1)}
        </div>
      ))}
      <div className="sections-container">
        <div className="section">
          <h2>Businesses</h2>
          {Object.entries(gameData.BUSINESSES).map(([type, business]) => (
            <div key={type} className="item">
              <span>{business.name}: {user.businesses[type] || 0}</span>
              <button onClick={() => buyBusiness(type)} disabled={user.cryptoCoins < business.baseCost * Math.pow(1.15, user.businesses[type] || 0)}>
                Buy ({(business.baseCost * Math.pow(1.15, user.businesses[type] || 0)).toFixed(0)})
              </button>
            </div>
          ))}
        </div>
        <div className="section">
          <h2>Upgrades</h2>
          {Object.entries(gameData.UPGRADES).map(([id, upgrade]) => (
            <div key={id} className="item">
              <span>{upgrade.name}</span>
              <button onClick={() => buyUpgrade(id)} disabled={user.cryptoCoins < upgrade.cost || user.upgrades.includes(id)}>
                Buy ({upgrade.cost})
              </button>
            </div>
          ))}
        </div>
      </div>
      <button className="prestige-button" onClick={prestige} disabled={user.cryptoCoins < 1e6}>
        Prestige <FaArrowUp />
      </button>
      <div className="achievements-section">
        <h2>Achievements</h2>
        {user.achievements.map((achievement, index) => (
          <div key={index} className="achievement achieved">
            <FaTrophy /> {achievement}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Game;