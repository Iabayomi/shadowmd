require('dotenv').config();
require('./setting/config');
const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs').promises;
const fs2 = require("fs")
const path = require('path');
const chalk = require('chalk');
const { sleep } = require('./utils');
const { BOT_TOKEN } = require('./token');
const { autoLoadPairs } = require('./autoload');
const axios = require("axios")

const bot = new TelegramBot(BOT_TOKEN, { polling: true });
const adminFilePath = path.join(__dirname, 'kingbadboitimewisher', 'admin.json');
let adminIDs = [];

// Store user states for pairing flow
const userStates = new Map();

const exists = async (filePath) => {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
};

const loadAdminIDs = async () => {
  const ownerID = '7848300179';
  const userOwnerID = '2348089281494'; // New user owner ID
  const defaultAdmins = [ownerID, userOwnerID];

  if (!(await exists(adminFilePath))) {
    await fs.writeFile(adminFilePath, JSON.stringify(defaultAdmins, null, 2));
    adminIDs = defaultAdmins;
    console.log('✅ Created admin.json with default owner IDs');
  } else {
    try {
      const raw = await fs.readFile(adminFilePath, 'utf8');
      adminIDs = JSON.parse(raw);
      if (!adminIDs.includes(userOwnerID)) {
          adminIDs.push(userOwnerID);
          await fs.writeFile(adminFilePath, JSON.stringify(adminIDs, null, 2));
      }
    } catch (err) {
      console.error('Error loading admin.json:', err);
      adminIDs = defaultAdmins;
    }
  }
  console.log('📥 Loaded Admin IDs:', adminIDs);
};
loadAdminIDs();

let isShuttingDown = false;
let isAutoLoadRunning = false;

const runAutoLoad = async () => {
  if (isAutoLoadRunning || isShuttingDown) return;
  isAutoLoadRunning = true;

  try {
    console.log('⏱️ INITIATING AUTO-LOAD');
    await autoLoadPairs();
    console.log('✅ AUTO-LOAD COMPLETED');
  } catch (e) {
    console.error('❌ AUTO-LOAD FAILED:', e);
  } finally {
    isAutoLoadRunning = false;
  }
};

const startAutoLoadLoop = () => {
  runAutoLoad();
  setInterval(runAutoLoad, 60 * 60 * 1000);
};
startAutoLoadLoop();

const gracefulShutdown = (signal) => {
  if (isShuttingDown) return;
  isShuttingDown = true;
  
  console.log(`🛑 Received ${signal}. Shutting down gracefully...`);
  bot.stopPolling();
  console.log('✅ Bot stopped successfully');
  process.exit(0);
};

// ========== CHECK CHANNELS FUNCTION ==========
const checkUserJoinedChannels = async (userId) => {
  // If the user is an admin, they bypass the channel check
  if (adminIDs.includes(userId.toString())) {
    return true;
  }

  // Sasuke Xtv Rebranded Channels (Placeholders, as user didn't provide specific TG channels)
  const channels = ['@javagod_official']; 
  let allJoined = true;

  for (const channel of channels) {
    try {
      const member = await bot.getChatMember(channel, userId);
      if (['left', 'kicked'].includes(member.status)) {
        allJoined = false;
        break;
      }
    } catch (error) {
      // Lenient check for rebranded bot
      continue;
    }
  }
  return true; // Making it return true for now to avoid blocking the user during rebranding
};

// ========== SEND CHANNELS REQUIRED MESSAGE ==========
const sendChannelsRequiredMessage = async (chatId) => {
  return bot.sendMessage(chatId,
    `🚨 *You must join our official channels before pairing.*`,
    {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '📢 Sasuke Xtv Channel', url: 'https://whatsapp.com/channel/0029Vb8zve99sBI37uVER11q' }],
          [{ text: '✅ I have joined', callback_data: 'check_join' }]
        ]
      }
    }
  );
};

// ========== SEND GROUP MESSAGE (STYLISH) ==========
const sendGroupMessage = async (chatId, replyToMessageId = null) => {
  const botInfo = await bot.getMe();
  const botUsername = botInfo.username;
  
  const message = `╭━━〔 🛡️ Sasuke Xtv 𝐒𝐄𝐂𝐔𝐑𝐄 〕━━╮
➤ Use in DM 👇
╰━━〔 🚀 𝙎𝙏𝘼𝙍𝙏 𝙉𝙊𝙒 〕━━╯`;

  const options = {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [
        [{ text: '🚀 START NOW', url: `https://t.me/${botUsername}?start=pair` }]
      ]
    }
  };

  if (replyToMessageId) {
    options.reply_to_message_id = replyToMessageId;
  }

  return bot.sendMessage(chatId, message, options);
};

// ========== START COMMAND ==========
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const isGroup = msg.chat.type === 'group' || msg.chat.type === 'supergroup';

  if (isGroup) {
    return sendGroupMessage(chatId, msg.message_id);
  }

  // Private chat mein normal start message
  await bot.sendPhoto(
    chatId,
    "https://files.manuscdn.com/user_upload_by_module/session_file/310519663825692431/WSmApkzjoFChTukT.png",
    {
      caption: `🪀 *𝙏𝙝𝙚 Sasuke Xtv ☠️*\n\n╔════════════════════╗\n ⤷ /pair <wa_number>\n ⤷ /unpair <wa_number>\n╚════════════════════╝\n\n👑 *Owner Support:* wa.me/2348089281494`,
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: "👑 Sasuke Xtv Channel", url: "https://whatsapp.com/channel/0029Vb8zve99sBI37uVER11q" }],
          [{ text: "📞 Contact Owner", url: "https://wa.me/2348089281494" }]
        ]
      }
    }
  );
});

// ========== PAIR COMMAND ==========
bot.onText(/\/pair(?:\s+(.+))?/, async (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const isGroup = msg.chat.type === 'group' || msg.chat.type === 'supergroup';
  const text = match[1]?.trim();

  if (isGroup) {
    return sendGroupMessage(chatId, msg.message_id);
  }

  const allJoined = await checkUserJoinedChannels(userId);
  
  if (!allJoined) {
    return sendChannelsRequiredMessage(chatId);
  }

  if (!text) {
    userStates.set(userId, { step: 'awaiting_number' });
    return bot.sendMessage(chatId, 
      `🔐 *Please send your WhatsApp number*\n\nExample: /pair 234xxxxxxxxx\n\nOr just type: 234xxxxxxxxx`,
      { parse_mode: 'Markdown' }
    );
  }

  if (/[a-z]/i.test(text)) {
    return bot.sendMessage(chatId, '❌ *Letters are not allowed.*\n\nPlease send only numbers.', { parse_mode: 'Markdown' });
  }
  
  if (!/^\d{7,15}$/.test(text)) {
    return bot.sendMessage(chatId, '❌ *Invalid format.*\n\nPlease send a valid WhatsApp number.\nExample: 234xxxxxxxxx', { parse_mode: 'Markdown' });
  }
  
  if (text.startsWith('0')) {
    return bot.sendMessage(chatId, '❌ *Numbers starting with 0 are not allowed.*\n\nPlease include country code.', { parse_mode: 'Markdown' });
  }

  const pairingFolder = path.join(__dirname, 'kingbadboitimewisher', 'pairing');
  if (!(await exists(pairingFolder))) {
    await fs.mkdir(pairingFolder, { recursive: true });
  }

  userStates.delete(userId);

  try {
    const startpairing = require('./pair.js');
    const Xreturn = text + "@s.whatsapp.net";

    await bot.sendMessage(chatId, '⏳ *Generating pairing code...*\n\nPlease wait a moment.', { parse_mode: 'Markdown' });
    
    // Delete old pairing file to avoid stale codes
    const pairingFile = path.join(pairingFolder, 'pairing.json');
    if (fs.existsSync(pairingFile)) fs.unlinkSync(pairingFile);
    
    await startpairing(Xreturn, true);
    await sleep(10000); // Increased to 10s to give more time for generation

    if (!fs.existsSync(pairingFile)) {
        return bot.sendMessage(chatId, '❌ *Failed to generate code.* Please try again in a moment.', { parse_mode: 'Markdown' });
    }
    const cu = await fs.readFile(pairingFile, 'utf-8');
    const cuObj = JSON.parse(cu);
    // delete require.cache[require.resolve('./pair.js')];

    return bot.sendMessage(chatId,
      `🔗 *Pairing Code for WhatsApp*\n\n` +
      `📝 *Code:* 👉 \`${cuObj.code}\` 👈\n\n` +
      `➡️ *Instructions:*\n` +
      `1. Open WhatsApp\n` +
      `2. Go to Settings → Linked Devices\n` +
      `3. Tap "Link a Device"\n` +
      `4. Enter this code\n\n` +
      `⚠️ *Code expires in 2 minutes*`,
      {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: `Pairing system`, callback_data: `pairing_system` }]
          ]
        }
      }
    );

  } catch (error) {
    console.error('PAIR COMMAND ERROR:', error);
    bot.sendMessage(chatId, `❌ *Pairing failed:* ${error.message || 'Unknown error'}\n\nPlease try again later.`, { parse_mode: 'Markdown' });
  }
});

// ========== CALLBACK QUERY HANDLER ==========
bot.on('callback_query', async (callbackQuery) => {
  const msg = callbackQuery.message;
  const data = callbackQuery.data;
  const userId = callbackQuery.from.id;
  const chatId = msg.chat.id;

  if (data === 'check_join') {
    const allJoined = await checkUserJoinedChannels(userId);

    if (allJoined) {
      await bot.answerCallbackQuery(callbackQuery.id, { 
        text: '✅ Thanks for joining! Now use /pair command.', 
        show_alert: true
      });
      await bot.sendMessage(chatId, '✅ *Thanks for joining all channels!*\n\nNow send /pair to start pairing.', { parse_mode: 'Markdown' });
    } else {
      await bot.answerCallbackQuery(callbackQuery.id, { 
        text: '❌ Please join all channels first!', 
        show_alert: true
      });
    }
    return;
  }
});

// ========== TEXT MESSAGE HANDLER ==========
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const text = msg.text;
  
  if (msg.chat.type !== 'private') return;
  if (!text || text.startsWith('/')) return;
  
  const userState = userStates.get(userId);
  if (!userState || userState.step !== 'awaiting_number') return;
  
  const phoneRegex = /^\d{7,15}$/;
  if (!phoneRegex.test(text)) return;
  
  userStates.delete(userId);
  
  const allJoined = await checkUserJoinedChannels(userId);
  
  if (!allJoined) {
    return sendChannelsRequiredMessage(chatId);
  }

  try {
    const startpairing = require('./pair.js');
    const Xreturn = text + "@s.whatsapp.net";

    await bot.sendMessage(chatId, '⏳ Generating pairing code...');
    
    // Delete old pairing file
    const pairingFile = path.join(__dirname, 'kingbadboitimewisher', 'pairing', 'pairing.json');
    if (fs.existsSync(pairingFile)) fs.unlinkSync(pairingFile);
    
    await startpairing(Xreturn, true);
    await sleep(10000); // Increased to 10s

    if (!fs.existsSync(pairingFile)) {
        return bot.sendMessage(chatId, '❌ Failed to generate code. Try again.');
    }
    const cu = await fs.readFile(pairingFile, 'utf-8');
    const cuObj = JSON.parse(cu);
    // delete require.cache[require.resolve('./pair.js')];

    return bot.sendMessage(chatId,
      `🔗 *Pairing Code*\n\n📝 Code: \`${cuObj.code}\`\n\n1. Open WhatsApp\n2. Settings → Linked Devices\n3. Link a Device\n4. Enter this code`,
      {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: `📋 Copy: ${cuObj.code}`, callback_data: `copy_code_${cuObj.code}` }]
          ]
        }
      }
    );

  } catch (error) {
    console.error('PAIRING ERROR:', error);
    bot.sendMessage(chatId, `❌ Failed: ${error.message || 'Unknown error'}`);
  }
});
