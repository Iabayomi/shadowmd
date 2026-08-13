/**
   * Create By Sasuke Xtv
   * Contact Me on WhatsApp: https://whatsapp.com/channel/0029Vb8zve99sBI37uVER11q
*/

const fs = require('fs');
const axios = require('axios');
const path = require('path');
const readline = require('readline');
const chalk = require('chalk');
const figlet = require('figlet');
const express = require('express');

const app = express();
const port = process.env.PORT || 8000;

// Health check & Admin Panel
app.get('/', (req, res) => {
    const uptime = runtime(process.uptime());
    const pairedUsersCount = fs.existsSync(PAIRING_DIR) 
        ? fs.readdirSync(PAIRING_DIR, { withFileTypes: true }).filter(d => d.isDirectory()).length 
        : 0;

    res.status(200).send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Sasuke Xtv Admin Panel</title>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #0f0f0f; color: #e0e0e0; margin: 0; display: flex; align-items: center; justify-content: center; height: 100vh; }
            .card { background: #1a1a1a; padding: 2rem; border-radius: 15px; box-shadow: 0 8px 32px rgba(0,0,0,0.5); border: 1px solid #333; max-width: 500px; width: 90%; text-align: center; }
            h1 { color: #bb86fc; margin-bottom: 0.5rem; }
            .status { display: inline-block; padding: 0.5rem 1rem; background: #03dac6; color: #000; border-radius: 20px; font-weight: bold; margin-bottom: 1.5rem; }
            .info { text-align: left; background: #252525; padding: 1rem; border-radius: 8px; margin-bottom: 1rem; }
            .info p { margin: 0.5rem 0; font-size: 0.9rem; }
            .info b { color: #cf6679; }
            .footer { font-size: 0.8rem; color: #777; margin-top: 1rem; }
            .btn { display: block; width: 100%; padding: 0.8rem; background: #bb86fc; color: #000; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 1rem; transition: 0.3s; }
            .btn:hover { background: #9965f4; }
        </style>
    </head>
    <body>
        <div class="card">
            <h1>Sasuke Xtv Bot</h1>
            <div class="status">● ONLINE</div>
            <div class="info">
                <p><b>Uptime:</b> ${uptime}</p>
                <p><b>Active Sessions:</b> ${pairedUsersCount}</p>
                <p><b>Platform:</b> Linux (Render/Railway)</p>
                <p><b>Version:</b> 2.0.0</p>
            </div>
            <a href="https://whatsapp.com/channel/0029Vb8zve99sBI37uVER11q" class="btn">Join Official Channel</a>
            <div class="footer">Powered by Sasuke Xtv Official</div>
        </div>
    </body>
    </html>
    `);
});

// Helper function for uptime
function runtime(seconds) {
	seconds = Number(seconds);
	var d = Math.floor(seconds / (3600 * 24));
	var h = Math.floor(seconds % (3600 * 24) / 3600);
	var m = Math.floor(seconds % 3600 / 60);
	var s = Math.floor(seconds % 60);
	var dDisplay = d > 0 ? d + (d == 1 ? " day, " : " days, ") : "";
	var hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
	var mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
	var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
	return dDisplay + hDisplay + mDisplay + sDisplay;
}

const server = app.listen(port, () => {
    console.log(chalk.green(`🌐 Web server started on port ${port}`));
});

// 🔥 ANTI-SLEEP MECHANISM (For Render/Railway)
const RENDER_URL = process.env.RENDER_EXTERNAL_URL || `http://localhost:${port}`;
setInterval(() => {
    axios.get(RENDER_URL)
        .then(() => console.log(chalk.gray('💓 Anti-sleep: Self-ping successful')))
        .catch(err => console.log(chalk.gray('💓 Anti-sleep: Self-ping failed (expected if local)')));
}, 5 * 60 * 1000); // Ping every 5 minutes

// 🔥 SCHEDULED RESTART (Every 12 hours)
// This prevents memory leaks and ensures long-term stability
const RESTART_INTERVAL = 12 * 60 * 60 * 1000; 
setTimeout(() => {
    console.log(chalk.yellow('🔄 Scheduled restart: Refreshing bot for stability...'));
    process.exit(0);
}, RESTART_INTERVAL);

const AUTH_FILE = './auth.json';
const PAIRING_DIR = './kingbadboitimewisher/pairing/';

const startpairing = require('./pair');

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const autoLoadPairs = async () => {
    console.log(chalk.cyan('🔄 Auto-loading all paired users...'));
    
    if (!fs.existsSync(PAIRING_DIR)) {
        console.log(chalk.red('❌ Pairing directory not found.'));
        return;
    }

    const pairedUsers = fs.readdirSync(PAIRING_DIR, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name)
        .filter(name => name.endsWith('@s.whatsapp.net'));

    if (pairedUsers.length === 0) {
        console.log(chalk.yellow('ℹ️  No paired users found.'));
        return;
    }

    console.log(chalk.green(`✅ Found ${pairedUsers.length} paired users. Starting connections...`));
    
    // Reduce initial delay for faster startup on Render
    await delay(1000);

    // Process sessions in small batches to avoid hitting memory limits or connection rate limits
    const BATCH_SIZE = 5; 
    for (let i = 0; i < pairedUsers.length; i += BATCH_SIZE) {
        const batch = pairedUsers.slice(i, i + BATCH_SIZE);
        console.log(chalk.blue(`🔄 Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(pairedUsers.length / BATCH_SIZE)}...`));
        
        await Promise.all(batch.map(async (userNumber, index) => {
            try {
                console.log(chalk.blue(`🔄 Connecting user: ${userNumber}`));
                await startpairing(userNumber);
                console.log(chalk.green(`✅ Connected successfully: ${userNumber}`));
            } catch (error) {
                console.log(chalk.red(`❌ Failed for ${userNumber}: ${error.message}`));
            }
        }));

        if (i + BATCH_SIZE < pairedUsers.length) {
            console.log(chalk.blue('⏳ Waiting 2 seconds before next batch...'));
            await delay(2000);
        }
    }

    console.log(chalk.green('✅ All paired users processed.'));
};

const initializeBot = async () => {
    console.clear();
    console.log(chalk.cyan(figlet.textSync('Sasuke Xtv', {
        font: 'Standard',
        horizontalLayout: 'default',
        verticalLayout: 'default'
    })));
    
    console.log(chalk.yellow('\n═══════════════════════════════════════════════'));
    console.log(chalk.green('   Sasuke Xtv 𝐩𝐚𝐢𝐫𝐢𝐧𝐠 𝐬𝐲𝐬𝐭𝐞𝐦       '));
    console.log(chalk.yellow('═══════════════════════════════════════════════\n'));

    // 🔥 ONLY ONE SYSTEM SHOULD LOAD PAIRS
    // launchBot() will trigger bot.js, which calls autoload.js
    // We don't need to call autoLoadPairs() here anymore
    
    launchBot();
};

function launchBot() {
    console.log(chalk.green('🚀 Starting Sasuke Xtv system...\n'));

    let telegramLoaded = false;
    let whatsappLoaded = false;

    // Load Telegram bot (bot.js)
    const botPath = path.join(__dirname, 'bot.js');
    if (fs.existsSync(botPath)) {
        try {
            console.log(chalk.blue('📱 Loading Telegram pairing system...'));
            require('./bot');
            telegramLoaded = true;
            console.log(chalk.green('✅Sasuke Xtv bot loaded successfully!'));
        } catch (error) {
            console.log(chalk.red('❌ Failed to load Telegram bot (bot.js):'));
            console.log(chalk.red('   Error:', error.message));
            console.log(chalk.yellow('⚠️  Continuing without Telegram bot...\n'));
        }
    }

    // Load WhatsApp commands (drenox.js)
    const drenoxPath = path.join(__dirname, 'drenox.js');
    if (fs.existsSync(drenoxPath)) {
        try {
            console.log(chalk.blue('💬 Loading WhatsApp commands system...'));
            require('./drenox');
            whatsappLoaded = true;
            console.log(chalk.green('✅ WhatsApp commands loaded successfully!'));
        } catch (error) {
            console.log(chalk.red('❌ Failed to load WhatsApp commands (drenox.js):'));
            console.log(chalk.red('   Error:', error.message));
            console.log(chalk.yellow('⚠️  Continuing without WhatsApp commands...\n'));
        }
    }

    // Summary
    console.log(chalk.cyan('\n═══════════════════════════════════════════════'));
    console.log(chalk.bold.white('Sasuke Xtv BOT INITIALIZATION SUMMARY          '));
    console.log(chalk.cyan('═══════════════════════════════════════════════'));
    console.log(telegramLoaded ? chalk.green('✅Sasuke Xtv тɛℓɛɢяαм вσт: Active') : chalk.red('❌ Inactive'));
    console.log(whatsappLoaded ? chalk.green('✅ WhatsApp Commands: Active') : chalk.red('❌ Inactive'));
    console.log(chalk.cyan('═══════════════════════════════════════════════\n'));

    // Error handlers
    const ignoredErrors = [
        'Socket connection timeout',
        'EKEYTYPE',
        'item-not-found',
        'rate-overlimit',
        'Connection Closed',
        'Timed Out',
        'Value not found'
    ];

    process.on('unhandledRejection', (reason, promise) => {
        if (ignoredErrors.some(e => String(reason).includes(e))) return;
        console.log(chalk.red('\n⚠️  Unhandled Promise Rejection:'), reason);
    });

    process.on('uncaughtException', (error) => {
        if (ignoredErrors.some(e => String(error).includes(e))) return;
        console.log(chalk.red('\n❌ Uncaught Exception:'), error.message);
    });

    console.log(chalk.blue('📊 Bot monitoring active...'));
}

// Graceful shutdown
process.on('SIGINT', () => {
    console.log(chalk.yellow('\n\n⚠️  Shutting down gracefully...'));
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log(chalk.yellow('\n\n⚠️  Received termination signal...'));
    process.exit(0);
});

initializeBot().catch((error) => {
    console.log(chalk.red('\n❌ Fatal error during initialization:'), error.message);
    process.exit(1);
});
