/**
   * Create By ༒︎ 𝑺𝑯𝑨𝑫𝑶𝑾 ༒︎
   * Contact Me on wa.me/923271054080
*/

const fetch = require('node-fetch')
const axios = require("axios");
const { 
    proto, 
    getContentType 
} = require("@whiskeysockets/baileys");

// Helper function to sleep/delay
const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Helper function to check if string is a URL
const isUrl = (url) => {
    return url.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/, 'gi'))
}

// Get buffer from URL
const getBuffer = async (url, options = {}) => {
    try {
        const res = await axios({
            method: "get",
            url,
            headers: {
                'DNT': 1,
                'Upgrade-Insecure-Request': 1
            },
            ...options,
            responseType: 'arraybuffer'
        })
        return res.data
    } catch (e) {
        console.log(`Error in getBuffer: ${e}`)
    }
}

// Get size of media
const getSizeMedia = (buffer) => {
    return new Promise((resolve, reject) => {
        const size = Buffer.byteLength(buffer)
        if (size >= 1000000000) {
            resolve((size / 1000000000).toFixed(2) + ' GB')
        } else if (size >= 1000000) {
            resolve((size / 1000000).toFixed(2) + ' MB')
        } else if (size >= 1000) {
            resolve((size / 1000).toFixed(2) + ' KB')
        } else {
            resolve(size + ' B')
        }
    })
}

// Generate message tag
const generateMessageTag = () => {
    return `3EB0${Math.floor(Math.random() * 1000000000)}`
}

class Function {
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    runtime(seconds) {
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
    
    async fetchJson(url, options = {}) {
        try {
            let data = await axios(url, {
                method: "get",
                headers: {
                    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36',
                    origin: url,
                    referer: url
                },
                responseType: 'json'
            })

            return data?.data
        } catch (e) {
            return e
        }
    }

    getUserName(user) {
        try {
            var last_name = user["last_name"] || ""
            var full_name = user.first_name + " " + last_name
            user["full_name"] = full_name.trim()
            return user
        } catch (e) {
            throw e
        }
    }
    
    isUrl(url) {
        return url.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/, 'gi'))
    }
    
    range(start, stop, step) {
        if (typeof stop == 'undefined') {
            stop = start;
            start = 0;
        }
        if (typeof step == 'undefined') {
            step = 1;
        }
        if ((step > 0 && start >= stop) || (step < 0 && start <= stop)) {
            return [];
        }
        var result = [];
        for (var i = start; step > 0 ? i < stop : i > stop; i += step) {
            result.push(i);
        }
        return result;
    }
}

function smsg(bad, m, store) {
    if (!m) return m
    let M = proto.WebMessageInfo
    if (m.key) {
        m.id = m.key.id
        m.isBaileys = m.id.startsWith('BAE5') && m.id.length === 16
       
        m.chat = m.key.remoteJid
        m.fromMe = m.key.fromMe
        m.isGroup = m.chat.endsWith('@g.us')
        m.sender = bad.decodeJid(m.fromMe && bad.user.id || m.participant || m.key.participant || m.chat || '')
        if (m.isGroup) m.participant = bad.decodeJid(m.key.participant) || ''
    }
    if (m.message) {
        m.mtype = getContentType(m.message)
        m.msg = (m.mtype == 'viewOnceMessage' ? m.message[m.mtype]?.message?.[getContentType(m.message[m.mtype]?.message)] : m.message[m.mtype]) || {}
        m.body = m.message.conversation || m.msg?.caption || m.msg?.text || (m.mtype == 'listResponseMessage' && m.msg?.singleSelectReply?.selectedRowId) || (m.mtype == 'buttonsResponseMessage' && m.msg?.selectedButtonId) || (m.mtype == 'viewOnceMessage' && m.msg?.caption) || m.text || ''
        let quoted = m.quoted = m.msg?.contextInfo?.quotedMessage || null
        m.mentionedJid = m.msg?.contextInfo?.mentionedJid || []
        if (m.quoted) {
            let type = getContentType(quoted)
            m.quoted = m.quoted[type]
            if (['productMessage'].includes(type)) {
                type = getContentType(m.quoted)
                m.quoted = m.quoted[type]
            }
            if (typeof m.quoted === 'string') m.quoted = {
                text: m.quoted
            }
            m.quoted.mtype = type
            m.quoted.id = m.msg.contextInfo.stanzaId
            m.quoted.chat = m.msg.contextInfo.remoteJid || m.chat
            m.quoted.isBaileys = m.quoted.id ? m.quoted.id.startsWith('BAE5') && m.quoted.id.length === 16 : false
            m.quoted.sender = bad.decodeJid(m.msg.contextInfo.participant)
            m.quoted.fromMe = m.quoted.sender === bad.decodeJid(bad.user.id)
            m.quoted.text = m.quoted.text || m.quoted.caption || m.quoted.conversation || m.quoted.contentText || m.quoted.selectedDisplayText || m.quoted.title || ''
            m.quoted.mentionedJid = m.msg.contextInfo ? m.msg.contextInfo.mentionedJid : []
            m.getQuotedObj = m.getQuotedMessage = async () => {
                if (!m.quoted.id) return false
                let q = await store.loadMessage(m.chat, m.quoted.id, bad)
                return smsg(bad, q, store)
            }
            let vM = M.fromObject({
                key: {
                    remoteJid: m.quoted.chat,
                    fromMe: m.quoted.fromMe,
                    id: m.quoted.id
                },
                message: quoted,
                ...(m.isGroup ? { participant: m.quoted.sender } : {})
            })
            m.quoted.delete = () => bad.sendMessage(m.quoted.chat, { delete: vM.key })
            m.quoted.copyNForward = (jid, forceForward = false, options = {}) => bad.copyNForward(jid, vM, forceForward, options)
            m.quoted.download = () => bad.downloadMediaMessage(m.quoted)
        }
    }
    if (m.msg?.url) m.download = () => bad.downloadMediaMessage(m.msg)
    m.text = m.msg?.text || m.msg?.caption || m.message?.conversation || m.msg?.contentText || m.msg?.selectedDisplayText || m.msg?.title || ''
    m.reply = (text, chatId = m.chat, options = {}) => Buffer.isBuffer(text) ? bad.sendMedia(chatId, text, 'file', '', m, { ...options }) : bad.sendText(chatId, text, m, { ...options })
    m.copy = () => smsg(bad, M.fromObject(M.toObject(m)))
    m.copyNForward = (jid = m.chat, forceForward = false, options = {}) => bad.copyNForward(jid, m, forceForward, options)

    return m
}

// Export all functions
module.exports = {
    simple: new Function(),
    sleep,
    isUrl,
    getBuffer,
    getSizeMedia,
    generateMessageTag,
    fetch,
    smsg
}
