// Backend: src/botCommands.js
const { Telegraf } = require('telegraf');
const { getStatus, getBusinesses, getUpgrades, prestige } = require('./gameLogic');

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

bot.command('start', (ctx) => {
  ctx.reply('Welcome to Crypto Capitalist! Use /status to check your progress.');
});

bot.command('status', (ctx) => {
  const userId = ctx.from.id;
  ctx.reply(getStatus(userId));
});

bot.command('businesses', (ctx) => {
  ctx.reply(getBusinesses());
});

bot.command('upgrades', (ctx) => {
  ctx.reply(getUpgrades());
});

bot.command('prestige', (ctx) => {
  const userId = ctx.from.id;
  const result = prestige(userId);
  if (result) {
    ctx.reply(`Prestige successful! You gained ${result.prestigePoints} prestige points.`);
  } else {
    ctx.reply('Not enough coins to prestige. You need at least 1 million coins.');
  }
});

module.exports = { bot };