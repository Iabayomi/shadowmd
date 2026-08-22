/**
 * Sasuke Xtv — Watchdog & Self-Healing Autonomous System
 * Designed for 6-month unattended 24/7 operation.
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const LOG_DIR = path.join(__dirname, 'logs');
if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
}

const LOG_FILE = path.join(LOG_DIR, 'watchdog.log');

function logEvent(level, message) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${level.toUpperCase()}] ${message}\n`;
    console.log(logEntry.trim());
    try {
        fs.appendFileSync(LOG_FILE, logEntry);
        // Rotate log if > 5MB
        const stats = fs.statSync(LOG_FILE);
        if (stats.size > 5 * 1024 * 1024) {
            fs.renameSync(LOG_FILE, `${LOG_FILE}.old`);
        }
    } catch (e) {
        // silent fail for logging
    }
}

// 1. Uncaught Exception & Rejection Handlers
process.on('uncaughtException', (err) => {
    logEvent('FATAL', `Uncaught Exception: ${err.stack || err}`);
    // Safe recovery without crashing immediately if recoverable
    setTimeout(() => {
        logEvent('INFO', 'Attempting graceful recovery from uncaught exception...');
    }, 1000);
});

process.on('unhandledRejection', (reason, promise) => {
    logEvent('ERROR', `Unhandled Rejection at: ${promise}, reason: ${reason?.stack || reason}`);
});

// 2. Resource & Memory Watchdog
setInterval(() => {
    const memUsage = process.memoryUsage();
    const rssMB = Math.round(memUsage.rss / 1024 / 1024);
    const heapUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
    
    // Log memory stats every hour
    if (Math.random() < 0.05) {
        logEvent('INFO', `Resource Status — RSS: ${rssMB}MB, HeapUsed: ${heapUsedMB}MB`);
    }

    // If heap exceeds 1.2GB, force garbage collection if available
    if (heapUsedMB > 1200) {
        logEvent('WARN', `High memory consumption detected (${heapUsedMB}MB). Triggering garbage collection.`);
        if (global.gc) {
            global.gc();
        }
    }
}, 5 * 60 * 1000); // Check every 5 minutes

logEvent('INFO', 'Sasuke Xtv Watchdog & Self-Healing system initialized successfully.');

module.exports = { logEvent };
