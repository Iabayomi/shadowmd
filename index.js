/**
   * Create By JAVA GOD
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

// Health check for Render
app.get('/', (req, res) => {
    res.status(200).send('JAVA GOD Bot is running!');
});

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
    console.log(chalk.cyan(figlet.textSync('JAVA GOD', {
        font: 'Standard',
        horizontalLayout: 'default',
        verticalLayout: 'default'
    })));
    
    console.log(chalk.yellow('\n═══════════════════════════════════════════════'));
    console.log(chalk.green('   𝐉𝐚𝐯𝐚 𝐆𝐨𝐝 𝐩𝐚𝐢𝐫𝐢𝐧𝐠 𝐬𝐲𝐬𝐭𝐞𝐦       '));
    console.log(chalk.yellow('═══════════════════════════════════════════════\n'));

    // Start loading pairs in the background to allow the main process to remain responsive
    autoLoadPairs().catch(err => console.error('Error in autoLoadPairs:', err));
    
    launchBot();
};

function launchBot() {
    console.log(chalk.green('🚀 Starting 𝐉𝐀𝐕𝐀 𝐆𝐎𝐃 system...\n'));

    let telegramLoaded = false;
    let whatsappLoaded = false;

    // Load Telegram bot (bot.js)
    const botPath = path.join(__dirname, 'bot.js');
    if (fs.existsSync(botPath)) {
        try {
            console.log(chalk.blue('📱 Loading Telegram pairing system...'));
            require('./bot');
            telegramLoaded = true;
            console.log(chalk.green('✅𝐉𝐀𝐕𝐀 𝐆𝐎𝐃 bot loaded successfully!'));
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
    console.log(chalk.bold.white('𝐉𝐀𝐕𝐀 𝐆𝐎𝐃 BOT INITIALIZATION SUMMARY          '));
    console.log(chalk.cyan('═══════════════════════════════════════════════'));
    console.log(telegramLoaded ? chalk.green('✅𝐉𝐀𝐕𝐀 𝐆𝐎𝐃 тɛℓɛɢяαм вσт: Active') : chalk.red('❌ Inactive'));
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
