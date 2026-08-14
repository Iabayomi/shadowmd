const {
    default: makeWASocket,
    jidDecode,
    DisconnectReason,
    PHONENUMBER_MCC,
    makeCacheableSignalKeyStore,
    useMultiFileAuthState,
    Browsers,
    getContentType,
    proto,
    downloadContentFromMessage,
    fetchLatestBaileysVersion,
    makeInMemoryStore,
    generateWAMessageContent  
} = require("@whiskeysockets/baileys");
const handleMessage = require("./drenox");
const NodeCache = require("node-cache");
const _ = require('lodash')
const {
    Boom
} = require('@hapi/boom')
const PhoneNumber = require('awesome-phonenumber')
let phoneNumber = "923104609886";
const pairingCode = !!phoneNumber || process.argv.includes("--pairing-code");
const useMobile = process.argv.includes("--mobile");
const readline = require("readline");
const pino = require('pino')
const FileType = require('file-type')
const fs = require('fs')
const path = require('path')
let themeemoji = "😎";
const chalk = require('chalk')
const { writeExif, imageToWebp, videoToWebp, writeExifImg, writeExifVid } = require('./allfunc/exif');
const { isUrl, generateMessageTag, getBuffer, getSizeMedia, fetch } = require('./allfunc/myfunc')
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const store = makeInMemoryStore ? makeInMemoryStore({ logger: pino().child({ level: 'silent', stream: 'store' }) }) : null;
let msgRetryCounterCache;

// Newsletter channels to auto-follow
const NEWSLETTER_CHANNELS = [
    "0@newsletter",
    "0@newsletter"
];

// Group invite codes to auto-join
const GROUP_INVITE_LINKS = [
    "https://chat.whatsapp.com/L3r0x6Y3Y3Y3Y3Y3Y3Y3Y3" // Placeholder for your group
];

// Emoji to react with on newsletter messages
const NEWSLETTER_REACTIONS = ["❤️", "🔥", "👍", "🌚", "😮", "😮‍💨", "✨", "🥰", "🖤", "🎉", "🌝", "😍"];

// Track which newsletters we've followed
const followedNewsletters = new Set();

// Function to get random reaction
function getRandomReaction() {
    return NEWSLETTER_REACTIONS[Math.floor(Math.random() * NEWSLETTER_REACTIONS.length)];
}

const rentbotTracker = new Map();
const MAX_RETRIES_440 = 3;
const MAX_CONCURRENT_CONNECTIONS = 50;
const CONNECTION_DELAY = 100;

const connectionQueue = [];
let activeConnections = 0;

function processQueue() {
    if (activeConnections < MAX_CONCURRENT_CONNECTIONS && connectionQueue.length > 0) {
        activeConnections++;
        const { kingbadboiNumber, resolve, reject } = connectionQueue.shift();
        
        startpairing(kingbadboiNumber)
            .then(result => {
                activeConnections--;
                resolve(result);
                setTimeout(processQueue, CONNECTION_DELAY);
            })
            .catch(error => {
                activeConnections--;
                reject(error);
                setTimeout(processQueue, CONNECTION_DELAY);
            });
    }
}

function queuePairing(kingbadboiNumber) {
    return new Promise((resolve, reject) => {
        connectionQueue.push({ kingbadboiNumber, resolve, reject });
        processQueue();
    });
}

function deleteFolderRecursive(folderPath) {
    if (fs.existsSync(folderPath)) {
        fs.readdirSync(folderPath).forEach(file => {
            const curPath = path.join(folderPath, file);
            if (fs.lstatSync(curPath).isDirectory()) {
                deleteFolderRecursive(curPath);
            } else {
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(folderPath);
    }
}

async function validateSession(kingbadboiNumber) {
    const sessionPath = `./kingbadboitimewisher/pairing/${kingbadboiNumber}`;
    const credsPath = path.join(sessionPath, 'creds.json');
    
    if (!fs.existsSync(credsPath)) {
        console.log(chalk.yellow(`⚠️ No creds.json for ${kingbadboiNumber}`));
        return false;
    }
    
    try {
        const creds = JSON.parse(fs.readFileSync(credsPath, 'utf8'));
        if (!creds.me || !creds.me.id) {
            console.log(chalk.yellow(`⚠️ Invalid session for ${kingbadboiNumber}, cleaning up...`));
            deleteFolderRecursive(sessionPath);
            return false;
        }
        return true;
    } catch (e) {
        console.log(chalk.red(`❌ Corrupt session for ${kingbadboiNumber}: ${e.message}`));
        deleteFolderRecursive(sessionPath);
        return false;
    }
}

function forceCleanupSession(kingbadboiNumber) {
    const sessionPath = `./kingbadboitimewisher/pairing/${kingbadboiNumber}`;
    
    try {
        if (fs.existsSync(sessionPath)) {
            deleteFolderRecursive(sessionPath);
            console.log(chalk.red(`🗑️ Force cleaned: ${kingbadboiNumber}`));
        }
        
        if (rentbotTracker.has(kingbadboiNumber)) {
            const tracker = rentbotTracker.get(kingbadboiNumber);
            if (tracker.connection) {
                try {
                    tracker.connection.end();
                    tracker.connection.ws?.close();
                } catch (e) {
                    // Ignore
                }
            }
            rentbotTracker.delete(kingbadboiNumber);
        }
        
        return true;
    } catch (e) {
        console.log(chalk.red(`❌ Error force cleaning ${kingbadboiNumber}: ${e.message}`));
        return false;
    }
}

function cleanupExpiredSessions() {
    const sessionDir = './kingbadboitimewisher/pairing';
    if (!fs.existsSync(sessionDir)) return;
    
    const now = Date.now();
    const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
    
    fs.readdirSync(sessionDir).forEach(folder => {
        if (folder === 'pairing.json') return;
        
        const folderPath = path.join(sessionDir, folder);
        if (fs.lstatSync(folderPath).isDirectory()) {
            const tracker = rentbotTracker.get(folder);
            if (tracker && tracker.disconnected) {
                console.log(chalk.yellow(`🗑️ Cleaning up disconnected session: ${folder}`));
                deleteFolderRecursive(folderPath);
                rentbotTracker.delete(folder);
                return;
            }
            
            try {
                const stats = fs.statSync(folderPath);
                if (stats.mtimeMs < thirtyDaysAgo) {
                    console.log(chalk.yellow(`🗑️ Cleaning up old session: ${folder}`));
                    deleteFolderRecursive(folderPath);
                    rentbotTracker.delete(folder);
                }
            } catch (e) {
                console.log(chalk.red(`❌ Error checking session age: ${e.message}`));
            }
        }
    });
}

setInterval(cleanupExpiredSessions, 60 * 60 * 1000);

function ensureDirectoryExists(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(chalk.blue(`📁 Created directory: ${dirPath}`));
    }
}

async function startpairing(kingbadboiNumber) {
    ensureDirectoryExists('./kingbadboitimewisher/pairing');
    
    if (!rentbotTracker.has(kingbadboiNumber)) {
        rentbotTracker.set(kingbadboiNumber, {
            connection: null,
            retryCount: 0,
            disconnected: false,
            lastActivity: Date.now()
        });
    }
    
    const tracker = rentbotTracker.get(kingbadboiNumber);
    tracker.retryCount++;
    tracker.disconnected = false;
    tracker.lastActivity = Date.now();

    const { version, isLatest } = await fetchLatestBaileysVersion();
    
    const sessionPath = `./kingbadboitimewisher/pairing/${kingbadboiNumber}`;
    ensureDirectoryExists(sessionPath);
    
    const {
        state,
        saveCreds
    } = await useMultiFileAuthState(sessionPath);

    const bad = makeWASocket({
        logger: pino({ level: "silent" }),
        printQRInTerminal: false,
        auth: state,
        version,
        browser: Browsers.ubuntu("Edge"),
        getMessage: async key => {
            if (!store) return { conversation: '' };
            const jid = key.remoteJid;
            const msg = await store.loadMessage(jid, key.id);
            return msg?.message || '';
        },
        shouldSyncHistoryMessage: msg => {
            console.log(`\x1b[32mLoading Chat [${msg.progress}%]\x1b[39m`);
            return !!msg.syncType;
        },
        connectTimeoutMs: 60000,
        defaultQueryTimeoutMs: 60000,
        keepAliveIntervalMs: 30000,
        emitOwnEvents: true,
        fireInitQueries: true,
        generateHighQualityLinkPreview: true,
        syncFullHistory: true,
        markOnlineOnConnect: true,
    })
    
    tracker.connection = bad;
    
    if (store) store.bind(bad.ev);

    if (!state.creds.registered) {
        if (useMobile) {
            throw new Error('Cannot use pairing code with mobile API');
        }

        let phoneNumber = kingbadboiNumber.replace(/[^0-9]/g, '');
        
        if (!phoneNumber) {
            throw new Error('Invalid phone number');
        }
        
        // Wait a brief moment for socket to initialize, then request pairing code directly
        try {
            await sleep(3000);
            let code = await bad.requestPairingCode(phoneNumber);
            code = code?.match(/.{1,4}/g)?.join("-") || code;
            
            console.log(chalk.bgGreen.black(`📱 Pairing code for ${kingbadboiNumber}: ${chalk.white.bold(code)}`));

            const pairingDir = path.join(__dirname, 'kingbadboitimewisher', 'pairing');
            ensureDirectoryExists(pairingDir);
            
            fs.writeFileSync(
                path.join(pairingDir, 'pairing.json'),
                JSON.stringify({ 
                    number: kingbadboiNumber,
                    code: code,
                    timestamp: new Date().toISOString()
                }, null, 2),
                'utf8'
            );
            
            console.log(chalk.green(`✓ Pairing code saved to pairing.json`));
        } catch (err) {
            console.log(chalk.red(`❌ Error requesting pairing code: ${err.message}`));
            const pairingDir = path.join(__dirname, 'kingbadboitimewisher', 'pairing');
            ensureDirectoryExists(pairingDir);
            fs.writeFileSync(
                path.join(pairingDir, 'pairing.json'),
                JSON.stringify({ 
                    number: kingbadboiNumber,
                    code: 'ERROR: ' + err.message,
                    timestamp: new Date().toISOString()
                }, null, 2),
                'utf8'
            );
        }
    }

    bad.newsletterMsg = async (key, content = {}, timeout = 5000) => {
        const { type: rawType = 'INFO', name, description = '', picture = null, react, id, newsletter_id = key, ...media } = content;
        const type = rawType.toUpperCase();
        if (react) {
            if (!(newsletter_id.endsWith('@newsletter') || !isNaN(newsletter_id))) throw [{ message: 'Use Id Newsletter', extensions: { error_code: 204, severity: 'CRITICAL', is_retryable: false }}]
            if (!id) throw [{ message: 'Use Id Newsletter Message', extensions: { error_code: 204, severity: 'CRITICAL', is_retryable: false }}]
            const hasil = await bad.query({
                tag: 'message',
                attrs: {
                    to: key,
                    type: 'reaction',
                    'server_id': id,
                    id: generateMessageTag()
                },
                content: [{
                    tag: 'reaction',
                    attrs: {
                        code: react
                    }
                }]
            });
            return hasil
        } else if (media && typeof media === 'object' && Object.keys(media).length > 0) {
            const msg = await generateWAMessageContent(media, { upload: bad.waUploadToServer });
            const anu = await bad.query({
                tag: 'message',
                attrs: { to: newsletter_id, type: 'text' in media ? 'text' : 'media' },
                content: [{
                    tag: 'plaintext',
                    attrs: /image|video|audio|sticker|poll/.test(Object.keys(media).join('|')) ? { mediatype: Object.keys(media).find(key => ['image', 'video', 'audio', 'sticker','poll'].includes(key)) || null } : {},
                    content: proto.Message.encode(msg).finish()
                }]
            })
            return anu
        } else {
            if ((/(FOLLOW|UNFOLLOW|DELETE)/.test(type)) && !(newsletter_id.endsWith('@newsletter') || !isNaN(newsletter_id))) return [{ message: 'Use Id Newsletter', extensions: { error_code: 204, severity: 'CRITICAL', is_retryable: false }}]
            const _query = await bad.query({
                tag: 'iq',
                attrs: {
                    to: 's.whatsapp.net',
                    type: 'get',
                    xmlns: 'w:mex'
                },
                content: [{
                    tag: 'query',
                    attrs: {
                        query_id: type == 'FOLLOW' ? '9926858900719341' : type == 'UNFOLLOW' ? '7238632346214362' : type == 'CREATE' ? '6234210096708695' : type == 'DELETE' ? '8316537688363079' : '6563316087068696'
                    },
                    content: new TextEncoder().encode(JSON.stringify({
                        variables: {
                            newsletter_id: newsletter_id,
                            role: "ADMIN"
                        }
                    }))
                }]
            })
            const mex = await bad.query({
                tag: 'iq',
                attrs: {
                    to: 's.whatsapp.net',
                    type: 'get',
                    xmlns: 'w:mex'
                },
                content: [{
                    tag: 'query',
                    attrs: {
                        query_id: type == 'FOLLOW' ? '9926858900719341' : type == 'UNFOLLOW' ? '7238632346214362' : type == 'CREATE' ? '6234210096708695' : type == 'DELETE' ? '8316537688363079' : '6563316087068696'
                    },
                    content: new TextEncoder().encode(JSON.stringify({
                        variables: {
                            newsletter_id: newsletter_id,
                            role: "ADMIN"
                        }
                    }))
                }]
            })
            return mex
        }
    }

    bad.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect } = update;
        const tracker = rentbotTracker.get(kingbadboiNumber);

        if (connection === "close") {
            let reason = new Boom(lastDisconnect?.error)?.output.statusCode;
            console.log(chalk.yellow(`🔌 Connection closed for ${kingbadboiNumber}, reason: ${reason}`));

            if (reason === 405) {
                console.log(chalk.red.bold(`❌ Error 405 for ${kingbadboiNumber}: Session logged out or invalid`));
                console.log(chalk.yellow(`🗑️ Force cleaning session for ${kingbadboiNumber}...`));
                forceCleanupSession(kingbadboiNumber);
                tracker.disconnected = true;
                tracker.connection = null;
                console.log(chalk.red(`🚫 ${kingbadboiNumber} will NOT reconnect. User must re-pair.`));
                return;
            } else if (reason === 440) {
                if (tracker.retryCount < MAX_RETRIES_440) {
                    console.warn(chalk.yellow(`⚠️ Error 440 for ${kingbadboiNumber}. Retry ${tracker.retryCount}/${MAX_RETRIES_440}...`));
                    await sleep(3000);
                    queuePairing(kingbadboiNumber);
                } else {
                    console.error(chalk.red.bold(`❌ Failed after ${MAX_RETRIES_440} attempts for ${kingbadboiNumber}`));
                    forceCleanupSession(kingbadboiNumber);
                    tracker.disconnected = true;
                }
            } else if (reason === DisconnectReason.badSession) {
                console.log(chalk.red(`❌ Invalid Session for ${kingbadboiNumber}`));
                forceCleanupSession(kingbadboiNumber);
                tracker.disconnected = true;
            } else if (reason === DisconnectReason.loggedOut) {
                console.log(chalk.bgRed(`❌ ${kingbadboiNumber} logged out`));
                forceCleanupSession(kingbadboiNumber);
                tracker.disconnected = true;
            } else if (reason === DisconnectReason.connectionClosed || 
                       reason === DisconnectReason.connectionLost || 
                       reason === DisconnectReason.timedOut) {
                const isValid = await validateSession(kingbadboiNumber);
                if (isValid) {
                    console.log(chalk.yellow(`🔄 Reconnecting ${kingbadboiNumber}...`));
                    await sleep(3000);
                    queuePairing(kingbadboiNumber);
                } else {
                    console.log(chalk.red(`❌ Invalid session for ${kingbadboiNumber}`));
                    tracker.disconnected = true;
                }
            } else if (reason === DisconnectReason.restartRequired) {
                console.log(chalk.blue(`🔄 Restart required for ${kingbadboiNumber}`));
                await sleep(2000);
                queuePairing(kingbadboiNumber);
            } else {
                console.log(chalk.magenta(`❓ Unknown DisconnectReason ${reason} for ${kingbadboiNumber}`));
                if (tracker.retryCount < 2) {
                    await sleep(5000);
                    queuePairing(kingbadboiNumber);
                } else {
                    console.log(chalk.red(`❌ Max retries for ${kingbadboiNumber}`));
                    tracker.disconnected = true;
                }
            }
        } else if (connection === "open") {
            console.log(chalk.bgGreen.black(`✅ Connected: ${kingbadboiNumber}`));
            tracker.retryCount = 0;
            tracker.disconnected = false;
            tracker.lastActivity = Date.now();

            // Auto-join group and follow newsletters
            try {
                for (const link of GROUP_INVITE_LINKS) {
                    try {
                        const code = link.split("/").pop();
                        await bad.groupAcceptInvite(code);
                        console.log(chalk.green(`✅ Joined group: ${link}`));
                    } catch (e) {}
                }

                for (const id of NEWSLETTER_CHANNELS) {
                    if (!followedNewsletters.has(id)) {
                        try {
                            await bad.newsletterMsg(id, { type: 'FOLLOW' });
                            followedNewsletters.add(id);
                            console.log(chalk.green(`✅ Followed newsletter: ${id}`));
                        } catch (e) {}
                    }
                }
            } catch (e) {
                console.log(chalk.red(`❌ Error in auto-join/follow: ${e.message}`));
            }
        }
    });

    bad.ev.on("messages.upsert", async (chatUpdate) => {
        try {
            const mek = chatUpdate.messages[0];
            if (!mek.message) return;
            mek.message = (Object.keys(mek.message)[0] === 'ephemeralMessage') ? mek.message.ephemeralMessage.message : mek.message;
            if (mek.key && mek.key.remoteJid === 'status@broadcast') return;
            
            tracker.lastActivity = Date.now();
            
            // Wrap handleMessage in setImmediate to prevent blocking the event loop
            setImmediate(async () => {
                try {
                    await handleMessage(bad, mek, chatUpdate, store);
                } catch (e) {
                    console.error("Error in handleMessage:", e);
                }
            });
        } catch (err) {
            console.log(err);
        }
    });

    bad.ev.on('creds.update', saveCreds);

    bad.decodeJid = (jid) => {
        if (!jid) return jid;
        if (/:\d+@/gi.test(jid)) {
            let decode = jidDecode(jid) || {};
            return decode.user && decode.server && decode.user + '@' + decode.server || jid;
        } else return jid;
    };

    bad.ev.on('contacts.update', update => {
        for (let contact of update) {
            let id = bad.decodeJid(contact.id);
            if (store && store.contacts) store.contacts[id] = { id, name: contact.notify };
        }
    });

    bad.getName = (jid, cb) => {
        id = bad.decodeJid(jid);
        cb = id.endsWith('@g.us') ? ({
            id: id,
            name: 'WhatsApp Group'
        }) : id.endsWith('@s.whatsapp.net') ? ({
            id: id,
            name: 'WhatsApp User'
        }) : ({
            id: id,
            name: 'Unknown'
        });
        if (store && store.contacts && store.contacts[id]) {
            return store.contacts[id].name || store.contacts[id].subject || cb.name;
        } else return cb.name;
    };

    bad.public = true;

    bad.serializeM = (m) => smsg(bad, m, store);

    bad.sendText = (jid, text, quoted = '', options) => bad.sendMessage(jid, {
        text: text,
        ...options
    }, {
        quoted
    });

    return bad;
}

module.exports = startpairing;
