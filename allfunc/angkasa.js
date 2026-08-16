/*

   BASE INI FREE NO SALE
   JIKA MENEMUKAN YANG MENJUAL BELIKAN
   HARAP LAPORKAN KE 
   DEVELOPER : https://t.me/angkasanybobo
   CHANNEL : https://t.me/angkasalagibobo
   ROOMPUBLIC : https://t.me/roomangkasa
   KEBUTUHAN HOSTING : https://angkasalagijajan.vercel.app

*/

const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const yts = require("yt-search");
const axios = require('axios');
const sharp = require("sharp");
const path = require("path");
const { TOKEN, APIKEY, GROUP_ID, GROUP_LINK } = require('./config');
const moment = require('moment-timezone');
const bot = new TelegramBot(TOKEN, { polling: true });

const groupsFile = path.join(__dirname, "database/jasher.json");
const dbAntiShare = path.join(__dirname, "./database/antishare.json");
const dbAntiLink = path.join(__dirname, './database/antilink.json');
let khodamList = [];

//===================== FUNCTION =====================

function escapeHtml(text) {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

async function uploadToCatbox(fileBuffer, filename) {
  const form = new FormData();
  form.append("reqtype", "fileupload");
  form.append("fileToUpload", new Blob([fileBuffer]), filename);

  const res = await fetch("https://catbox.moe/user/api.php", {
    method: "POST",
    body: form,
  });

  const text = await res.text();
  if (!res.ok || text.startsWith("ERROR")) {
    throw new Error("Upload gagal: " + text);
  }
  return text.trim();
}

async function tiktok(url) {
  try {
    const encodedParams = new URLSearchParams();
    encodedParams.set("url", url);
    encodedParams.set("hd", "1");

    const response = await axios.post("https://tikwm.com/api/", encodedParams, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "Cookie": "current_language=en",
        "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36",
      },
    });

    if (!response.data || !response.data.data) {
      throw new Error("Gagal mendapatkan data TikTok");
    }

    const videos = response.data.data;
    return {
      title: videos.title,
      cover: videos.cover,
      origin_cover: videos.origin_cover,
      no_watermark: videos.play,
      watermark: videos.wmplay,
      music: videos.music,
    };
  } catch (error) {
    throw error;
  }
}

async function loadCekKhodam() {
  try {
    const url = "https://raw.githubusercontent.com/angkasanotdev/DatabaseRaw/refs/heads/main/cekkhodam.json";
    const res = await axios.get(url);
    cekKhodam = res.data;
    console.log("✅ Berhasil load List Cek Khodam:", cekKhodam.length, "item");
  } catch (err) {
    console.error("❌ Gagal load List Cek Khodam:", err.message);
  }
}

const getUptime = () => {
    const uptimeSeconds = process.uptime();
    const hours = Math.floor(uptimeSeconds / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);
    const seconds = Math.floor(uptimeSeconds % 60);

    return `${hours}h ${minutes}m ${seconds}s`;
};

const stickerDir = path.join(__dirname, "stickers");
if (!fs.existsSync(stickerDir)) fs.mkdirSync(stickerDir);

loadCekKhodam();

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}    

function komentarTampan(nilai) {
  if (nilai >= 100) return "💎 Ganteng dewa, mustahil diciptakan ulang.";
  if (nilai >= 94) return "🔥 Ganteng gila! Mirip artis Korea!";
  if (nilai >= 90) return "😎 Bintang iklan skincare!";
  if (nilai >= 83) return "✨ Wajahmu memantulkan sinar kebahagiaan.";
  if (nilai >= 78) return "🧼 Bersih dan rapih, cocok jadi influencer!";
  if (nilai >= 73) return "🆒 Ganteng natural, no filter!";
  if (nilai >= 68) return "😉 Banyak yang naksir nih kayaknya.";
  if (nilai >= 54) return "🙂 Lumayan sih... asal jangan senyum terus.";
  if (nilai >= 50) return "😐 Gantengnya malu-malu.";
  if (nilai >= 45) return "😬 Masih bisa lah asal percaya diri.";
  if (nilai >= 35) return "🤔 Hmm... mungkin bukan harinya.";
  if (nilai >= 30) return "🫥 Sedikit upgrade skincare boleh tuh.";
  if (nilai >= 20) return "🫣 Coba pose dari sudut lain?";
  if (nilai >= 10) return "😭 Yang penting akhlaknya ya...";
  return "😵 Gagal di wajah, semoga menang di hati.";
}

function komentarCantik(nilai) {
  if (nilai >= 100) return "👑 Cantiknya level dewi Olympus!";
  if (nilai >= 94) return "🌟 Glowing parah! Bikin semua iri!";
  if (nilai >= 90) return "💃 Jalan aja kayak jalan di runway!";
  if (nilai >= 83) return "✨ Inner & outer beauty combo!";
  if (nilai >= 78) return "💅 Cantik ala aesthetic tiktok!";
  if (nilai >= 73) return "😊 Manis dan mempesona!";
  if (nilai >= 68) return "😍 Bisa jadi idol nih!";
  if (nilai >= 54) return "😌 Cantik-cantik adem.";
  if (nilai >= 50) return "😐 Masih oke, tapi bisa lebih wow.";
  if (nilai >= 45) return "😬 Coba lighting lebih terang deh.";
  if (nilai >= 35) return "🤔 Unik sih... kayak seni modern.";
  if (nilai >= 30) return "🫥 Banyak yang lebih butuh makeup.";
  if (nilai >= 20) return "🫣 Mungkin inner beauty aja ya.";
  if (nilai >= 10) return "😭 Cinta itu buta kok.";
  return "😵 Semoga kamu lucu pas bayi.";
}

function komentarKaya(nilai) {
  if (nilai >= 100) return "💎 Sultan auto endorse siapa aja.";
  if (nilai >= 90) return "🛥️ Jet pribadi parkir di halaman rumah.";
  if (nilai >= 80) return "🏰 Rumahnya bisa buat konser.";
  if (nilai >= 70) return "💼 Bos besar! Duit ngalir terus.";
  if (nilai >= 60) return "🤑 Kaya banget, no debat.";
  if (nilai >= 50) return "💸 Kaya, tapi masih waras.";
  if (nilai >= 40) return "💳 Lumayan lah, saldo aman.";
  if (nilai >= 30) return "🏦 Kayanya sih... dari tampang.";
  if (nilai >= 20) return "🤔 Cukup buat traktir kopi.";
  if (nilai >= 10) return "🫠 Kaya hati, bukan dompet.";
  return "🙃 Duitnya imajinasi aja kayaknya.";
}

function komentarMiskin(nilai) {
  if (nilai >= 100) return "💀 Miskin absolut, utang warisan.";
  if (nilai >= 90) return "🥹 Mau beli gorengan mikir 3x.";
  if (nilai >= 80) return "😩 Isi dompet: angin & harapan.";
  if (nilai >= 70) return "😭 Bayar parkir aja utang.";
  if (nilai >= 60) return "🫥 Pernah beli pulsa receh?";
  if (nilai >= 50) return "😬 Makan indomie aja dibagi dua.";
  if (nilai >= 40) return "😅 Listrik token 5 ribu doang.";
  if (nilai >= 30) return "😔 Sering nanya *gratis ga nih?*";
  if (nilai >= 20) return "🫣 Semoga dapet bansos.";
  if (nilai >= 10) return "🥲 Yang penting hidup.";
  return "😵 Gaji = 0, tagihan = tak terbatas.";
}

function komentarJanda(nilai) {
  if (nilai >= 100) return "🔥 Janda premium, banyak yang ngantri.";
  if (nilai >= 90) return "💋 Bekas tapi masih segel.";
  if (nilai >= 80) return "🛵 Banyak yang ngajak balikan.";
  if (nilai >= 70) return "🌶️ Janda beranak dua, laku keras.";
  if (nilai >= 60) return "🧕 Pernah disakiti, sekarang bersinar.";
  if (nilai >= 50) return "🪞 Masih suka upload status galau.";
  if (nilai >= 40) return "🧍‍♀️ Janda low-profile.";
  if (nilai >= 30) return "💔 Ditinggal pas lagi sayang-sayangnya.";
  if (nilai >= 20) return "🫥 Baru ditinggal, masih labil.";
  if (nilai >= 10) return "🥲 Janda lokal, perlu support moral.";
  return "🚫 Masih istri orang, bro.";
}

function komentarPacar(nilai) {
  if (nilai >= 95) return "💍 Sudah tunangan, tinggal nikah.";
  if (nilai >= 85) return "❤️ Pacaran sehat, udah 3 tahun lebih.";
  if (nilai >= 70) return "😍 Lagi anget-angetnya.";
  if (nilai >= 60) return "😘 Sering video call tiap malam.";
  if (nilai >= 50) return "🫶 Saling sayang, tapi LDR.";
  if (nilai >= 40) return "😶 Dibilang pacaran, belum tentu. Tapi dibilang nggak, juga iya.";
  if (nilai >= 30) return "😅 Masih PDKT, nunggu sinyal.";
  if (nilai >= 20) return "🥲 Sering ngechat, tapi dicuekin.";
  if (nilai >= 10) return "🫠 Naksir diam-diam.";
  return "❌ Jomblo murni, nggak ada harapan sementara ini.";
}

function komentarSabar(nilai) {
  if (nilai >= 100) return "🌟 Wah, kamu luar biasa sabar dan hebat!";
  if (nilai >= 94) return "👍 Tetap sabar, kesuksesan sudah dekat.";
  if (nilai >= 90) return "😊 Sabar itu kunci, terus semangat ya!";
  if (nilai >= 83) return "💪 Kamu kuat, sabar sedikit lagi.";
  if (nilai >= 78) return "🌱 Sabar tumbuh jadi kekuatan.";
  if (nilai >= 73) return "✨ Jangan lelah bersabar, hasilnya manis.";
  if (nilai >= 68) return "🧘‍♂️ Tenang, sabar membawa kedamaian.";
  if (nilai >= 54) return "🌸 Sabar itu indah, teruslah berusaha.";
  if (nilai >= 50) return "🌈 Percaya deh, sabar ada hadiahnya.";
  if (nilai >= 45) return "☀️ Sabar sedikit lagi, kamu pasti bisa.";
  if (nilai >= 35) return "🌻 Jangan putus asa, sabar selalu membantu.";
  if (nilai >= 30) return "🕊️ Sabar itu pelajaran berharga.";
  if (nilai >= 20) return "🌿 Terus sabar ya, jangan menyerah.";
  if (nilai >= 10) return "🤲 Sedikit sabar, banyak berkah.";
  return "🙏 Sabar ya, setiap ujian ada hikmahnya.";
}

function komentarTolol(nilai) {
  if (nilai >= 100) return "🤪 Wah, level tololmu sudah master, salut!";
  if (nilai >= 94) return "😂 Udah pinter, tapi masih suka kocak.";
  if (nilai >= 90) return "😜 Kreatif banget, tolol yang menghibur!";
  if (nilai >= 83) return "😅 Santai aja, semua orang kadang tolol.";
  if (nilai >= 78) return "😆 Lumayan kocak, jangan berubah ya.";
  if (nilai >= 73) return "😉 Tolol tapi charming, kombinasi keren.";
  if (nilai >= 68) return "😎 Asal jangan kebanyakan mikir, santuy.";
  if (nilai >= 54) return "🤭 Jangan sedih, tolol itu manusiawi.";
  if (nilai >= 50) return "🙂 Santuy, semua ada waktunya.";
  if (nilai >= 45) return "😬 Masih wajar kok, jangan dipikirin.";
  if (nilai >= 35) return "🤔 Kadang tolol itu bikin lucu, ya kan?";
  if (nilai >= 30) return "😴 Santai, jangan terlalu serius.";
  if (nilai >= 20) return "😐 Bisa jadi tolol pintar, coba terus.";
  if (nilai >= 10) return "🙃 Hidup terlalu singkat buat terlalu serius.";
  return "😵 Wah, kamu jago banget jadi tolol, jangan berubah!";
}

function komentarMati(nilai) {
  if (nilai >= 100) return "💀 1 tahun lagi, kamu bakal jadi legenda!";
  if (nilai >= 94) return "☠️ 5 tahun lagi, siap-siap jadi juara!";
  if (nilai >= 90) return "🪦 10 tahun lagi, perjalanan masih panjang.";
  if (nilai >= 83) return "😵 15 tahun lagi, jangan berhenti berusaha.";
  if (nilai >= 78) return "🦴 20 tahun lagi, kesabaranmu diuji.";
  if (nilai >= 73) return "⚰️ 25 tahun lagi, semangat terus ya!";
  if (nilai >= 68) return "🕯️ 30 tahun lagi, jangan patah semangat.";
  if (nilai >= 54) return "🪦 40 tahun lagi, masih banyak waktu buat berkarya.";
  if (nilai >= 50) return "💤 50 tahun lagi, tetap jaga kesehatan dan mimpi.";
  if (nilai >= 45) return "🛌 60 tahun lagi, santai tapi jangan malas.";
  if (nilai >= 35) return "🌫️ 70 tahun lagi, teruslah berjuang.";
  if (nilai >= 30) return "😶‍🌫️ 80 tahun lagi, perjalanan panjang menanti.";
  if (nilai >= 20) return "🌙 90 tahun lagi, semangat terus hidupnya!";
  if (nilai >= 10) return "🌑 100 tahun lagi, kamu bakal jadi legenda abadi.";
  return "🌌 Lebih dari 100 tahun lagi, perjalananmu baru mulai.";
}

if (!fs.existsSync(dbAntiShare)) fs.writeFileSync(dbAntiShare, "{}");
let antiforward = JSON.parse(fs.readFileSync(dbAntiShare));

if (!fs.existsSync(dbAntiLink)) fs.writeFileSync(dbAntiLink, '{}');
let antilink = JSON.parse(fs.readFileSync(dbAntiLink));

//===================== COMMAND =====================

bot.onText(/\/start/, async (msg) => {
  const userId = msg.from.id;
  const chatId = msg.chat.id;
  const waktuRunPanel = getUptime();
  const jumlahFitur = "20";
  const VERSION = "0.2";
  const nama = msg.from.first_name || "User";
  
    const caption = `<blockquote>👋 Привет брат ${nama} Я — Md-бот, созданный Angkasa. Я готов сделать всё, что вы захотите. Если у вас есть дополнительные функции или предложения, пожалуйста, свяжитесь с разработчиком.
┗━━━━━━━━━━━━━━━⪼
┏━━⪼「 𝐈𝐍𝐅𝐎𝐑𝐌𝐀𝐓𝐈𝐎𝐍 」
┃𝗜𝗱 : ${userId}
┃𝗡𝗮𝗺𝗲 : —°𝐀𝐧𝐠𝐤𝐚𝐬𝐚
┃𝗩𝗲𝗿𝘀𝗶𝗼𝗻 : ${VERSION}
┃𝗢𝗻𝗹𝗶𝗻𝗲 : ${waktuRunPanel}
┃𝗝𝗨𝗠𝗟𝗔𝗛 𝗙𝗜𝗧𝗨𝗥 : ${jumlahFitur}
┃𝗗𝗲𝘃𝗲𝘃𝗲𝗹𝗼𝗽𝗲𝗿 : @angkasanyabobo
┗━━━━━━━━━━━━━━━━━━━━━━⪼</blockquote>`;

    const menu = {  
      caption,  
      parse_mode: 'HTML',  
      reply_markup: {  
        inline_keyboard: [  
          [ 
              { text: "𝗚𝗥𝗢𝗨𝗣", callback_data: "group" }
          ],
          [   
              { text: "𝗧𝗢𝗢𝗟𝗦", callback_data: "tools" },
              { text: "𝗠𝗢𝗥𝗘", callback_data: "more" },
              { text: "𝗧𝗤𝗧𝗢", callback_data: "tqto" }
          ],
          [
              { text: "𝗗𝗘𝗩𝗘𝗟𝗢𝗣𝗘𝗥", url: "https://t.me/angkasanyabobo" }
          ]
        ]
      }  
    };  

    bot.sendVideo(chatId, "https://files.catbox.moe/2z6ht6.mp4", menu);
});

bot.on("callback_query", async (query) => {
  const userId = query.from.id;
  const chatId = query.message.chat.id;
  const messageId = query.message.message_id;
  const data = query.data;
  const nama = query.from.first_name || "User";
  const waktuRunPanel = getUptime();
  const VERSION = "0.2";
  const jumlahFitur = "20";
  
  await bot.answerCallbackQuery(query.id);
  await bot.deleteMessage(chatId, messageId);

  const kembali = {
    inline_keyboard: [[{ text: "🔙 Kembali", callback_data: "back_home" }]],
  };
    
  const kirimMenuUtama = async () => {

    const caption = `<blockquote>👋 Привет брат ${nama} Я — Md-бот, созданный Angkasa. Я готов сделать всё, что вы захотите. Если у вас есть дополнительные функции или предложения, пожалуйста, свяжитесь с разработчиком.
┗━━━━━━━━━━━━━━━⪼
┏━━⪼「 𝐈𝐍𝐅𝐎𝐑𝐌𝐀𝐓𝐈𝐎𝐍 」
┃𝗜𝗱 : ${userId}
┃𝗡𝗮𝗺𝗲 : —°𝐀𝐧𝐠𝐤𝐚𝐬𝐚
┃𝗩𝗲𝗿𝘀𝗶𝗼𝗻 : ${VERSION}
┃𝗢𝗻𝗹𝗶𝗻𝗲 : ${waktuRunPanel}
┃𝗝𝗨𝗠𝗟𝗔𝗛 𝗙𝗜𝗧𝗨𝗥 : ${jumlahFitur}
┃𝗗𝗲𝘃𝗲𝘃𝗲𝗹𝗼𝗽𝗲𝗿 : @angkasanyabobo
┗━━━━━━━━━━━━━━━━━━━━━━⪼</blockquote>`;

    const menu = {
      caption,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [ 
              { text: "𝗚𝗥𝗢𝗨𝗣", callback_data: "group" }
          ],
          [   
              { text: "𝗧𝗢𝗢𝗟𝗦", callback_data: "tools" },
              { text: "𝗠𝗢𝗥𝗘", callback_data: "more" },
              { text: "𝗧𝗤𝗧𝗢", callback_data: "tqto" }
          ],
          [
              { text: "𝗗𝗘𝗩𝗘𝗟𝗢𝗣𝗘𝗥", url: "https://t.me/angkasanyabobo" }
          ]
        ],
      },
    };

    await bot.sendVideo(chatId, "https://files.catbox.moe/2z6ht6.mp4", menu);
  };

  if (data === "back_home") {
    return kirimMenuUtama();
  }

  if (data === "group") {
    return bot.sendVideo(
      chatId,
      "https://files.catbox.moe/2z6ht6.mp4",
      {
        caption: `<blockquote><b>〔🔐 —°𝐀𝐧𝐠𝐤𝐚𝐬𝐚 〕</b>
<b>╔─═⊱ 𝐈𝐍𝐅𝐎𝐑𝐌𝐀𝐓𝐈𝐎𝐍 ─═⬣</b>
<b>║ Nᴀᴍᴇ: —°𝐀𝐧𝐠𝐤𝐚𝐬𝐚</b>
<b>║ User: ${nama}</b>
<b>║ Dᴇᴠ: @angkasanyabobo</b>
<b>║ Vᴇʀsɪᴏɴ: ${VERSION}</b>
<b>║ Oɴʟɪɴᴇ: ${waktuRunPanel}</b>
<b>┗━━━━━━━━━━━━━━━⬣</b>
<b>┃        𝗚𝗥𝗢𝗨𝗣 𝗠𝗘𝗡𝗨</b>
<b>┃ ━━━━━━━━━━━━━━━━━</b>
<b>┃ /jasher</b>
<b>┃ /brat</b>
<b>┃ /iqc</b>
<b>┃ /play</b>
<b>┃ /tiktok</b>
<b>┃ ━━━━━━━━━━━━━━━━━</b>
<b>┃       —°𝐀𝐧𝐠𝐤𝐚𝐬𝐚</b>
<b>╰━━━━━━━━━━━━━━━━━╯</b></blockquote>`,
        parse_mode: "HTML",
        reply_markup: kembali,
      }
    );
  }

  if (data === "tools") {
    return bot.sendVideo(
      chatId,
      "https://files.catbox.moe/2z6ht6.mp4",
      {
        caption: `<blockquote><b>〔🔐 —°𝐀𝐧𝐠𝐤𝐚𝐬𝐚 〕</b>
<b>╔─═⊱ 𝐈𝐍𝐅𝐎𝐑𝐌𝐀𝐓𝐈𝐎𝐍 ─═⬣</b>
<b>║ Nᴀᴍᴇ: —°𝐀𝐧𝐠𝐤𝐚𝐬𝐚</b>
<b>║ User: ${nama}</b>
<b>║ Dᴇᴠ: @angkasanyabobo</b>
<b>║ Vᴇʀsɪᴏɴ: ${VERSION}</b>
<b>║ Oɴʟɪɴᴇ: ${waktuRunPanel}</b>
<b>┗━━━━━━━━━━━━━━━⬣</b>
<b>┃        𝗧𝗢𝗢𝗟𝗦 𝗠𝗘𝗡𝗨</b>
<b>┃ ━━━━━━━━━━━━━━━━━</b>
<b>┃ /id</b>
<b>┃ /hacknik</b>
<b>┃ /gethtml</b>
<b>┃ /tourl</b>
<b>┃ /nglspam</b>
<b>┃ /antishare</b>
<b>┃ /antilink</b>
<b>┃ ━━━━━━━━━━━━━━━━━</b>
<b>┃       —°𝐀𝐧𝐠𝐤𝐚𝐬𝐚</b>
<b>╰━━━━━━━━━━━━━━━━━╯</b></blockquote>`,
        parse_mode: "HTML",
        reply_markup: kembali,
      }
    );
  }

  if (data === "more") {
    return bot.sendVideo(
      chatId,
      "https://files.catbox.moe/2z6ht6.mp4",
      {
        caption: `<blockquote><b>〔🔐 —°𝐀𝐧𝐠𝐤𝐚𝐬𝐚 〕</b>
<b>╔─═⊱ 𝐈𝐍𝐅𝐎𝐑𝐌𝐀𝐓𝐈𝐎𝐍 ─═⬣</b>
<b>║ Nᴀᴍᴇ: —°𝐀𝐧𝐠𝐤𝐚𝐬𝐚</b>
<b>║ User: ${nama}</b>
<b>║ Dᴇᴠ: @angkasanyabobo</b>
<b>║ Vᴇʀsɪᴏɴ: ${VERSION}</b>
<b>║ Oɴʟɪɴᴇ: ${waktuRunPanel}</b>
<b>┗━━━━━━━━━━━━━━━⬣</b>
<b>┗━━━━━━━━━━━━━━━⬣</b>
<b>┃        𝗠𝗢𝗥𝗘 𝗠𝗘𝗡𝗨</b>
<b>┃ ━━━━━━━━━━━━━━━━━</b>
<b>┃ /cekkodam</b>
<b>┃ /cektampan</b>
<b>┃ /cekcantik</b>
<b>┃ /cekkaya</b>
<b>┃ /cekmiskin</b>
<b>┃ /cekjanda</b>
<b>┃ /cekpacar</b>
<b>┃ /ceksabar</b>
<b>┃ /cektolol</b>
<b>┃ /cekmati</b>
<b>┃ ━━━━━━━━━━━━━━━━━</b>
<b>┃       —°𝐀𝐧𝐠𝐤𝐚𝐬𝐚</b>
<b>╰━━━━━━━━━━━━━━━━━╯</b></blockquote>`,
        parse_mode: "HTML",
        reply_markup: kembali,
      }
    );
  }
  
  if (data === "tqto") {
    return bot.sendVideo(
      chatId,
      "https://files.catbox.moe/2z6ht6.mp4",
      {
        caption: `<blockquote><b>〔🔐 —°𝐀𝐧𝐠𝐤𝐚𝐬𝐚 〕</b>
<b>╔─═⊱ 𝐈𝐍𝐅𝐎𝐑𝐌𝐀𝐓𝐈𝐎𝐍 ─═⬣</b>
<b>║ Nᴀᴍᴇ: —°𝐀𝐧𝐠𝐤𝐚𝐬𝐚</b>
<b>║ User: ${nama}</b>
<b>║ Dᴇᴠ: @angkasanyabobo</b>
<b>║ Vᴇʀsɪᴏɴ: ${VERSION}</b>
<b>║ Oɴʟɪɴᴇ: ${waktuRunPanel}</b>
<b>┗━━━━━━━━━━━━━━━⬣</b>
<b>╭──〔 🤍 𝗦𝗨𝗣𝗣𝗢𝗥𝗧 〕──╮</b>
<b>├• Allah SWT ( The God )</b>
<b>├• Orang Tua ( My Support )</b>
<b>├• Zahra ( My Sister )</b>
<b>├• Ftmncloud ( Friend )</b>
<b>├• Rafzx ( Friend )</b>
<b>├• Azka Lyoraa ( Friend )</b>
<b>├• Axcal Official ( Friend )</b>
<b>├• Semua Subscribe</b>
<b>├• Semua Pengguna</b>
<b>├• Semua Buyer</b>
<b>╰──────────────────╯</b></blockquote>`,
        parse_mode: "HTML",
        reply_markup: kembali,
      }
    );
  }
});

//===================== GROUP =====================

bot.onText(/^\/jasher (.+)/s, async (msg, match) => {
  const chatId = msg.chat.id;
  const textBroadcast = match[1];
  const member = await bot.getChatMember(GROUP_ID, userId);
    if (member.status === 'left' || member.status === 'kicked') {
      return bot.sendMessage(chatId, `<blockquote>🚫 Kamu harus join channel official dulu supaya bisa pakai fitur ini.</blockquote>`, {
      parse_mode: "HTML", reply_markup: { inline_keyboard: [[{ text: "📢 Channel Official", url: GROUP_LINK }]] }
      });
    }
    
  if (!fs.existsSync(groupsFile)) {
    return bot.sendMessage(chatId, `<blockquote>Belum ada grup terdaftar untuk menerima broadcast, Tambahkan bot ke dalam group.</blockquote>`, {
      parse_mode: "HTML",
    });
  }

  const groups = JSON.parse(fs.readFileSync(groupsFile, "utf8"));
  if (!Array.isArray(groups) || !groups.length) {
    return bot.sendMessage(chatId, `<blockquote>⚠️ <b>Tidak ada grup tersimpan untuk broadcast.</b></blockquote>`, {
      parse_mode: "HTML",
    });
  }

  bot.tempBroadcast = {
    text: textBroadcast,
    userId: msg.from.id,
    stage: "askPhoto",
  };

  await bot.sendMessage(chatId, `<blockquote>🖼️ <b>Apakah kamu ingin menambahkan foto ke broadcast ini?</b></blockquote>`, {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [
        [
          { text: "✅ Iya", callback_data: "broadcast_yes" },
          { text: "❌ Tidak", callback_data: "broadcast_no" },
        ],
      ],
    },
  });
});

bot.on("callback_query", async (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;

  if (!bot.tempBroadcast || query.from.id !== bot.tempBroadcast.userId) {
    return bot.answerCallbackQuery(query.id, { text: "Perintah ini tidak untukmu." });
  }

  const { text } = bot.tempBroadcast;
  const groups = JSON.parse(fs.readFileSync(groupsFile, "utf8"));

  if (data === "broadcast_yes") {
    bot.tempBroadcast.stage = "waitingPhoto";
    await bot.sendMessage(chatId, `<blockquote>📸 <b>Kirimkan foto yang ingin kamu sertakan dalam broadcast ini.</b></blockquote>`, {
      parse_mode: "HTML",
    });
  }

  if (data === "broadcast_no") {
    await bot.sendMessage(chatId, `<blockquote>📢 <b>Mengirim broadcast ke ${groups.length} grup...</b></blockquote>`, {
      parse_mode: "HTML",
    });

    let success = 0;
    for (const groupId of groups) {
      try {
        await bot.sendMessage(groupId, `<blockquote>${bot.tempBroadcast.text}</blockquote>`, {
          parse_mode: "HTML",
        });
        success++;
      } catch (err) {
        console.log(`⚠️ Gagal kirim ke grup ${groupId}: ${err.message}`);
      }
      await new Promise((r) => setTimeout(r, 300));
    }

    bot.sendMessage(chatId, `<blockquote>✅ <b>Broadcast selesai!</b>\nBerhasil dikirim ke <b>${success}/${groups.length}</b> grup.</blockquote>`, {
      parse_mode: "HTML",
    });

    delete bot.tempBroadcast;
  }
});

bot.on("photo", async (msg) => {
  if (!bot.tempBroadcast || bot.tempBroadcast.stage !== "waitingPhoto") return;
  if (msg.from.id !== bot.tempBroadcast.userId) return;

  const chatId = msg.chat.id;
  const photoId = msg.photo[msg.photo.length - 1].file_id;
  const text = bot.tempBroadcast.text;
  const groups = JSON.parse(fs.readFileSync(groupsFile, "utf8"));

  await bot.sendMessage(chatId, `<blockquote>📢 <b>Mengirim broadcast teks + foto ke ${groups.length} grup...</b></blockquote>`, {
    parse_mode: "HTML",
  });

  let success = 0;
  for (const groupId of groups) {
    try {
      await bot.sendPhoto(groupId, photoId, {
        caption: `<blockquote>${text}</blockquote>`,
        parse_mode: "HTML",
      });
      success++;
    } catch (err) {
      console.log(`⚠️ Gagal kirim ke grup ${groupId}: ${err.message}`);
    }
    await new Promise((r) => setTimeout(r, 300));
  }

  bot.sendMessage(chatId, `<blockquote>✅ <b>Broadcast teks + foto selesai!</b>\nBerhasil dikirim ke <b>${success}/${groups.length}</b> grup.</blockquote>`, {
    parse_mode: "HTML",
  });

  delete bot.tempBroadcast;
});

bot.on("message", (msg) => {
  if (msg.chat.type === "group" || msg.chat.type === "supergroup") {
    try {
      let groups = [];
      if (fs.existsSync(groupsFile)) {
        groups = JSON.parse(fs.readFileSync(groupsFile, "utf8"));
      }

      if (!Array.isArray(groups)) groups = [];
      if (!groups.includes(msg.chat.id)) {
        groups.push(msg.chat.id);
        fs.writeFileSync(groupsFile, JSON.stringify(groups, null, 2));
        console.log(`✅ Grup baru disimpan: ${msg.chat.title} (${msg.chat.id})`);
      }
    } catch (err) {
      console.error("❌ Gagal menyimpan grup:", err.message);
    }
  }
});

bot.onText(/^\/brat (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const text = match[1];
  const member = await bot.getChatMember(GROUP_ID, userId);
    if (member.status === 'left' || member.status === 'kicked') {
      return bot.sendMessage(chatId, `<blockquote>🚫 Kamu harus join channel official dulu supaya bisa pakai fitur ini.</blockquote>`, {
      parse_mode: "HTML", reply_markup: { inline_keyboard: [[{ text: "📢 Channel Official", url: GROUP_LINK }]] }
      });
    }
    
  await bot.sendMessage(
    chatId,
    `<blockquote>⚙️ Membuat stiker dari teks: <b>${text}</b></blockquote>`,
    { parse_mode: "HTML" }
  );

  try {
    const response = await axios.post(
      "https://api.siputzx.my.id/api/m/brat",
      {
        text,
        isAnimated: false,
        delay: 100,
      },
      { responseType: "arraybuffer" }
    );

    const contentType = response.headers["content-type"];
    const buffer = Buffer.from(response.data);

    if (contentType.startsWith("image/")) {
      try {
        const webpBuffer = await sharp(buffer)
          .resize(512, 512, { fit: "inside" })
          .webp({ quality: 95 })
          .toBuffer();

        await bot.sendSticker(chatId, webpBuffer);

        const fileName = `brat_${Date.now()}.webp`;
        fs.writeFileSync(path.join(stickerDir, fileName), webpBuffer);

        await bot.sendMessage(
          chatId,
          `<blockquote>✅ Stiker berhasil dibuat!\n📁 Disimpan di: <code>stickers/${fileName}</code></blockquote>`,
          { parse_mode: "HTML" }
        );
      } catch (e) {
        console.error("❌ Gagal kirim sebagai stiker:", e.message);
        await bot.sendPhoto(chatId, buffer, {
          caption: `🖼️ Gagal kirim stiker, dikirim sebagai foto.`,
          parse_mode: "HTML",
        });
      }
    } else if (contentType.startsWith("video/")) {
      await bot.sendVideo(chatId, buffer, {
        caption: `🎬 Animasi brat dari teks: <b>${text}</b>`,
        parse_mode: "HTML",
      });
    } else {
      await bot.sendMessage(
        chatId,
        `<blockquote>⚠️ Format tidak diketahui, tidak bisa dikirim.</blockquote>`,
        { parse_mode: "HTML" }
      );
    }
  } catch (err) {
    console.error("Error /brat:", err);
    await bot.sendMessage(
      chatId,
      `<blockquote>❌ Gagal memproses: ${err.message}</blockquote>`,
      { parse_mode: "HTML" }
    );
  }
});

bot.onText(/^\/iqc (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const text = match[1];
  const member = await bot.getChatMember(GROUP_ID, userId);
    if (member.status === 'left' || member.status === 'kicked') {
      return bot.sendMessage(chatId, `<blockquote>🚫 Kamu harus join channel official dulu supaya bisa pakai fitur ini.</blockquote>`, {
      parse_mode: "HTML", reply_markup: { inline_keyboard: [[{ text: "📢 Channel Official", url: GROUP_LINK }]] }
      });
    }
    
  await bot.sendMessage(
    chatId,
    `<blockquote>⚙️ Membuat gambar IQC dari teks: <b>${text}</b></blockquote>`,
    { parse_mode: "HTML" }
  );

  try {
    const apiUrl = `https://api.betabotz.eu.org/api/maker/iqc?text=${encodeURIComponent(
      text
    )}&apikey=${APIKEY}`;

    const response = await axios.get(apiUrl, { responseType: "arraybuffer" });
    const contentType = response.headers["content-type"];
    const buffer = Buffer.from(response.data);

    if (contentType.startsWith("image/")) {
      await bot.sendPhoto(chatId, buffer, {
        caption: `<blockquote>✅ Gambar IQC berhasil dibuat dari teks: <b>${text}</b></blockquote>`,
        parse_mode: "HTML",
      });
    } else {
      await bot.sendMessage(chatId, `<blockquote>⚠️ Format file tidak dikenali.</blockquote>`, {
        parse_mode: "HTML",
      });
    }
  } catch (err) {
    console.error(err);
    await bot.sendMessage(
      chatId,
      `<blockquote>❌ Gagal memproses: ${err.message}</blockquote>`,
      { parse_mode: "HTML" }
    );
  }
});

bot.onText(/^\/play(?:@[\w_]+)?\s*(.*)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;  
    const searchText = match[1]?.trim();
    const member = await bot.getChatMember(GROUP_ID, userId);
    if (member.status === 'left' || member.status === 'kicked') {
      return bot.sendMessage(chatId, `<blockquote>🚫 Kamu harus join channel official dulu supaya bisa pakai fitur ini.</blockquote>`, {
      parse_mode: "HTML", reply_markup: { inline_keyboard: [[{ text: "📢 Channel Official", url: GROUP_LINK }]] }
      });
    }
    
    if (!searchText) {
        return bot.sendMessage(chatId, `<blockquote>❗ Contoh:\n/play komang</blockquote>`, { 
        parse_mode: "HTML" 
        });
    }

    await bot.sendMessage(chatId, `<blockquote>🔍 Mencari lagu...</blockquote>`, {
        parse_mode: "HTML"
        });

    try {

        const search = await yts(searchText);
        const video = search.videos[0];
        if (!video) return bot.sendMessage(chatId, `<blockquote>❌ Lagu tidak ditemukan.</blockquote>`);


        const res = await axios.get(`https://api.betabotz.eu.org/api/download/ytmp3`, {
            params: {
                url: video.url,
                apikey: APIKEY
            }
        });

        const data = res.data;
        if (!data.status) return bot.sendMessage(chatId, "❌ Gagal download lagu.");

 
        const mp3Url = data.result.mp3;
        const safeTitle = video.title.replace(/[<>:"/\\|?*]+/g, ''); 
        const filePath = path.join(__dirname, `${safeTitle}.mp3`);
        const audioRes = await axios.get(mp3Url, { responseType: 'arraybuffer' });
        fs.writeFileSync(filePath, audioRes.data);

 
        await bot.sendAudio(chatId, fs.createReadStream(filePath), {
            title: video.title,
            performer: video.author.name
        });

 
        fs.unlinkSync(filePath);

    } catch (err) {
        console.error(err);
        bot.sendMessage(chatId, `<blockquote>⚠️ Terjadi kesalahan saat memproses permintaan.</blockquote>`, {
        parse_mode: "HTML"
        });
    }
});

bot.onText(/^\/tiktok(?:\s+(.+))?$/, async (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const url = match[1];
  const member = await bot.getChatMember(GROUP_ID, userId);
    if (member.status === 'left' || member.status === 'kicked') {
      return bot.sendMessage(chatId, `<blockquote>🚫 Kamu harus join channel official dulu supaya bisa pakai fitur ini.</blockquote>`, {
      parse_mode: "HTML", reply_markup: { inline_keyboard: [[{ text: "📢 Channel Official", url: GROUP_LINK }]] }
      });
    }
  
  if (!url) {
    return bot.sendMessage(chatId, `<blockquote>☘️ Link TikTok-nya Mana?</blockquote>`, { 
    parse_mode: "HTML" 
    });
  }

 
  const urlRegex = /^(https?:\/\/)?([\w.-]+)+(:\d+)?(\/\S*)?$/;
  if (!urlRegex.test(url)) {
    return bot.sendMessage(chatId, `<blockquote>⚠️ Itu Bukan Link Yang Benar</blockquote>`, { 
    parse_mode: "HTML" 
    });
  }

  bot.sendMessage(chatId, `<blockquote>⏳ Tunggu sebentar, sedang mengambil video...</blockquote>`, {
        parse_mode: "HTML"
        });

  try {
  const res = await tiktok(url);

 
  let caption = `🎬 Judul: ${res.title}`;
     if (caption.length > 1020) {
     caption = caption.substring(0, 1017) + "...";
  }

await bot.sendVideo(chatId, res.no_watermark, { caption });
 
  if (res.music && res.music.trim() !== "") {
    await bot.sendAudio(chatId, res.music, { title: "tiktok_audio.mp3" });
  } else {
    await bot.sendMessage(chatId, `<blockquote>🎵 Video ini tidak memiliki audio asli.</blockquote>`, {
        parse_mode: "HTML"
        });
  }

} catch (error) {
  console.error(error);
  bot.sendMessage(chatId, `<blockquote>⚠️ Terjadi kesalahan saat mengambil video TikTok. Coba lagi nanti.</blockquote>`, {
        parse_mode: "HTML"
        });
}
});

//===================== TOOLS =====================

bot.onText(/\/id(?:\s+(@\w+))?/, async (msg, match) => {
  const chatId = msg.chat.id;
  let targetUser = msg.from;

  try {
    if (msg.reply_to_message) {
      targetUser = msg.reply_to_message.from;
    }

    else if (match[1]) {
      const username = match[1].replace('@', '');
      const members = await bot.getChatAdministrators(chatId);
      const found = members.find(m => m.user.username?.toLowerCase() === username.toLowerCase());

      if (found) {
        targetUser = found.user;
      } else {
        return bot.sendMessage(
          chatId,
          `<blockquote>❌ Tidak dapat menemukan info dari @${username}</blockquote>`,
          { parse_mode: "HTML" }
        );
      }
    }

    const userId = targetUser.id.toString();
    const name = targetUser.first_name
      ? escapeHtml(targetUser.first_name)
      : "-";
    const username = targetUser.username
      ? `@${escapeHtml(targetUser.username)}`
      : "-";
    const language = targetUser.language_code || "-";
    const userLink = `<a href="tg://user?id=${userId}">Klik di sini</a>`;

    const text = `<blockquote>👤 <b>Informasi Pengguna</b>:
• Nama     : ${name}
• Username : ${username}
• ID       : ${userId}
• Bahasa   : ${language}
• User Link: ${userLink}</blockquote>`;

    await bot.sendMessage(chatId, text, { parse_mode: "HTML" });
  } catch (err) {
    console.error("Error /id command:", err);
    bot.sendMessage(chatId, `<blockquote>⚠️ Terjadi kesalahan saat mengambil data pengguna.</blockquote>`, {
      parse_mode: "HTML",
    });
  }
});

bot.onText(/\/hacknik (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const nik = match[1];
  const member = await bot.getChatMember(GROUP_ID, userId);
    if (member.status === 'left' || member.status === 'kicked') {
      return bot.sendMessage(chatId, `<blockquote>🚫 Kamu harus join channel official dulu supaya bisa pakai fitur ini.</blockquote>`, {
      parse_mode: "HTML", reply_markup: { inline_keyboard: [[{ text: "📢 Channel Official", url: GROUP_LINK }]] }
      });
    }

  if (!/^\d{16}$/.test(nik)) {
    return bot.sendMessage(chatId, `<blockquote>⚠️ Format NIK tidak valid! Harus 16 digit angka.</blockquote>`, {
    parse_mode: "HTML"
    });
  }

  try {
    const response = await axios.get(`https://api.siputzx.my.id/api/tools/nik-checker?nik=${nik}`);
    const data = response.data;

    if (!data.status || !data.data || data.data.status !== "success") {
      return bot.sendMessage(chatId, `<blockquote>❌ Data tidak ditemukan atau terjadi kesalahan pada server.</blockquote>`, {
      parse_mode: "HTML"
      });
    }

    const d = data.data.data;
    const text = `<blockquote> 𝗖𝗘𝗞 𝗡𝗜𝗞 𝗗𝗢𝗡𝗘 𝗕𝗔𝗡𝗚
👤 <b>${d.nama}</b>
${d.kelamin === "PEREMPUAN" ? "♀️" : "♂️"} ${d.kelamin}
📅 <b>Tanggal Lahir:</b> ${d.tempat_lahir}
🎂 <b>Usia:</b> ${d.usia}
🏠 <b>Alamat:</b> ${d.alamat}
🏘️ <b>Kelurahan:</b> ${d.kelurahan}
🏞️ <b>Kecamatan:</b> ${d.kecamatan}
🏛️ <b>Kabupaten:</b> ${d.kabupaten}
🌍 <b>Provinsi:</b> ${d.provinsi}
🗳️ <b>TPS:</b> ${d.tps}
♎ <b>Zodiak:</b> ${d.zodiak}
📆 <b>Ulang Tahun Berikutnya:</b> ${d.ultah_mendatang}
📌 <b>Koordinat:</b> ${d.koordinat.lat}, ${d.koordinat.lon}
</blockquote>`;

    bot.sendMessage(chatId, text, { parse_mode: "HTML" });
  } catch (err) {
    console.error("Error cek NIK:", err.message);
    bot.sendMessage(chatId, "⚠️ Gagal mengambil data dari server!");
  }
});



bot.onText(/\/gethtml (.+)?/, async (msg, match) => {
    const chatId = msg.chat.id;
    const url = match[1];
    const member = await bot.getChatMember(GROUP_ID, userId);
    if (member.status === 'left' || member.status === 'kicked') {
      return bot.sendMessage(chatId, `<blockquote>🚫 Kamu harus join channel official dulu supaya bisa pakai fitur ini.</blockquote>`, {
      parse_mode: "HTML", reply_markup: { inline_keyboard: [[{ text: "📢 Channel Official", url: GROUP_LINK }]] }
      });
    }
    
    if (!/^https?:\/\//.test(url)) 
        return bot.sendMessage(chatId, `<blockquote>Ex: /get https://angkasa.my.id</blockquote>`, {
        parse_mode: "HTML"
        });

    bot.sendMessage(chatId, `<blockquote>⚡ Sedang mengambil file...</blockquote>`, {
    parse_mode: "HTML"
    });

    try {
        const res = await fetch(url);
        const contentLength = parseInt(res.headers.get("content-length") || "0");
        if (contentLength > 100 * 1024 * 1024)
            throw `File terlalu besar: ${contentLength} bytes`;

        const contentType = res.headers.get("content-type") || "";

        if (contentType.startsWith("image/")) {
            return bot.sendPhoto(chatId, url);
        }

        if (contentType.startsWith("video/")) {
            return bot.sendVideo(chatId, url);
        }

        if (contentType.startsWith("audio/")) {
            return bot.sendAudio(chatId, url, { caption: "Audio dari URL" });
        }

        const arrayBuffer = await res.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        if (contentType.includes("text") || contentType.includes("json")) {
            let text = buffer.toString();

            if (text.length > 4096) {
    const htmlContent = text;

    return bot.sendDocument(
        chatId,
        Buffer.from(htmlContent, "utf-8"),
        { caption: "Hasil HTML dari URL" },
        { filename: "result.html", contentType: "text/html" }
    );
} else {
                return bot.sendMessage(chatId, text);
            }
        } else {
            return bot.sendDocument(
                chatId,
                buffer,
                { caption: "File dari URL" },
                { filename: "file.bin", contentType: contentType || "application/octet-stream" }
            );
        }

    } catch (err) {
        return bot.sendMessage(chatId, `❌ Gagal mengambil file: ` + err);
    }
});



bot.onText(/\/tourl/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id; 
  const member = await bot.getChatMember(GROUP_ID, userId);
    if (member.status === 'left' || member.status === 'kicked') {
      return bot.sendMessage(chatId, `<blockquote>🚫 Kamu harus join channel official dulu supaya bisa pakai fitur ini.</blockquote>`, {
      parse_mode: "HTML", reply_markup: { inline_keyboard: [[{ text: "📢 Channel Official", url: GROUP_LINK }]] }
      });
    }
    
  const replyMsg = msg.reply_to_message;
  if (!replyMsg) {
    return bot.sendMessage(chatId, `<blockquote>❌ Balas sebuah pesan yang berisi file/audio/video dengan perintah /tourl2.</blockquote>`, {
    parse_mode: "HTML"
  });
  }

  if (!replyMsg.document && !replyMsg.photo && !replyMsg.video && !replyMsg.audio && !replyMsg.voice) {
    return bot.sendMessage(chatId,`<blockquote>❌ Pesan yang kamu balas tidak mengandung file/audio/video yang bisa diupload.</blockquote>`, {
    parse_mode: "HTML"
  });
  }

  try {
    let fileId, filename;

    if (replyMsg.document) {
      fileId = replyMsg.document.file_id;
      filename = replyMsg.document.file_name;
    } else if (replyMsg.photo) {
      const photoArray = replyMsg.photo;
      fileId = photoArray[photoArray.length - 1].file_id;
      filename = 'photo.jpg';
    } else if (replyMsg.video) {
      fileId = replyMsg.video.file_id;
      filename = replyMsg.video.file_name || 'video.mp4';
    } else if (replyMsg.audio) {
      fileId = replyMsg.audio.file_id;
      filename = replyMsg.audio.file_name || 'audio.mp3';
    } else if (replyMsg.voice) {
      fileId = replyMsg.voice.file_id;
      filename = 'voice.ogg';
    }

    const fileLink = await bot.getFileLink(fileId);
    const response = await fetch(fileLink);
    const fileBuffer = Buffer.from(await response.arrayBuffer());

    const catboxUrl = await uploadToCatbox(fileBuffer, filename);

    bot.sendMessage(chatId, `<blockquote>✅ File berhasil diupload ke Catbox:\n${catboxUrl}</blockquote>`, {
    parse_mode: "HTML"
  });
  } catch (err) {
    console.error(err);
    bot.sendMessage(chatId, `<blockquote>❌ Gagal upload file: ${err.message}</blockquote>`, {
    parse_mode: "HTML"
  });
  }
});

bot.onText(/\/nglspam (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const args = match[1].trim().split(" ");
  const userId = msg.from.id;
  const member = await bot.getChatMember(GROUP_ID, userId);
    if (member.status === 'left' || member.status === 'kicked') {
      return bot.sendMessage(chatId, `<blockquote>🚫 Kamu harus join channel official dulu supaya bisa pakai fitur ini.</blockquote>`, {
      parse_mode: "HTML", reply_markup: { inline_keyboard: [[{ text: "📢 Channel Official", url: GROUP_LINK }]] }
      });
    }
  
    if (args.length < 3) {
      return bot.sendMessage(
        chatId, `<blockquote>Format Salah!\n\nContoh: /ngl link text jumlah\n/ngl https://ngl.link/angkasa lu jelek 20 </blockquote>`, {
        parse_mode: 'HTML' 
        });
    }

    const link = args[0];
    const jumlah = parseInt(args[args.length - 1]);
    const pesan = args.slice(1, -1).join(" ");

    if (!/^https?:\/\/ngl\.link\//i.test(link)) {
      return bot.sendMessage(chatId, `<blockquote>❌ Link NGL tidak valid! Pastikan formatnya https://ngl.link/username</blockquote>`, {
        parse_mode: 'HTML' 
        });
    }

    if (isNaN(jumlah) || jumlah < 1 || jumlah > 200) {
      return bot.sendMessage(chatId, `<blockquote>❌ Jumlah pesan harus angka 1 - 100.</blockquote>`, {
        parse_mode: 'HTML' 
        });
    }

    try {
      const processingMsg = await bot.sendMessage(chatId, `<blockquote>⏳ Mengirim ${jumlah} pesan ke NGL...</blockquote>`, {
        parse_mode: 'HTML' 
        });

      const apiUrl = `https://api.siputzx.my.id/api/tools/ngl`;
      let success = 0, failed = 0;

      for (let i = 0; i < jumlah; i++) {
        try {
          await axios.post(apiUrl, {
            link: link,
            text: pesan
          }, { timeout: 10000 });

          success++;
          await new Promise(r => setTimeout(r, 1500));
        } catch {
          failed++;
        }
      }

      await bot.deleteMessage(chatId, processingMsg.message_id);

      await bot.sendMessage(
        chatId,
        `<blockquote>✅ Selesai Kirim Pesan NGL\n\n📩 Pesan: "${pesan}"\n📦 Total: ${jumlah}\n☑️ Berhasil: ${success}\n❌ Gagal: ${failed}</blockquote>`, {
        parse_mode: 'HTML' 
        });

    } catch (err) {
      console.error('[NGL ERROR]', err.message);
      bot.sendMessage(chatId, `<blockquote>❌ Gagal kirim ke NGL: ${err.message}</blockquote>`, {
        parse_mode: 'HTML' 
        });
    }
});

bot.onText(/^\/antishare(?:\s+(on|off))?$/i, async (msg, match) => {
  const chatId = msg.chat.id.toString();
  const senderId = msg.from.id;

  if (msg.chat.type === "private") {
    return bot.sendMessage(chatId, `<blockquote>❌ Perintah ini hanya bisa digunakan di grup.</blockquote>`, {
    parse_mode: "HTML"
    });
  }

  try {
    const admins = await bot.getChatAdministrators(chatId);
    const isAdmin = admins.some((admin) => admin.user.id === senderId);
    if (!isAdmin) {
      return bot.sendMessage(chatId, `<blockquote>❌ Hanya admin grup yang bisa mengatur AntiShare.</blockquote>`, {
    parse_mode: "HTML"
    });
    }

    const status = match[1] ? match[1].toLowerCase() : null;

    if (status === "on") {
      antiforward[chatId] = true;
      fs.writeFileSync(dbAntiShare, JSON.stringify(antiforward, null, 2));
      return bot.sendMessage(chatId, `<blockquote>✅ Antishare aktif di grup ini.</blockquote>`, {
    parse_mode: "HTML"
    });
    } else if (status === "off") {
      delete antiforward[chatId];
      fs.writeFileSync(dbAntiShare, JSON.stringify(antiforward, null, 2));
      return bot.sendMessage(chatId, `<blockquote>✅ AntiShare dimatikan di grup ini.</blockquote>`, {
    parse_mode: "HTML"
    });
    } else {
      return bot.sendMessage(chatId, `<blockquote>📌 Gunakan:\n/antishare on\n/antishare off</blockquote>`, {
    parse_mode: "HTML"
    });
    }
  } catch (err) {
    console.error("[ANTISHARE CMD ERROR]", err);
    bot.sendMessage(chatId, `<blockquote>❌ Terjadi kesalahan saat mengatur AntiShare.</blockquote>`, {
    parse_mode: "HTML"
    });
  }
});

bot.on("message", async (msg) => {
  const chatId = msg.chat.id.toString();

  if (antiforward[chatId]) {
    if (msg.forward_from || msg.forward_from_chat) {
      const admins = await bot.getChatAdministrators(chatId);
      const isAdmin = admins.some((admin) => admin.user.id === msg.from.id);

      if (!isAdmin) {
        try {
          await bot.deleteMessage(chatId, msg.message_id);
        } catch (e) {
          console.error("❌ Gagal hapus pesan forward:", e.message);
        }
      }
    }
  }
});

bot.onText(/^\/antilink(?:\s+(on|off))?$/i, async (msg, match) => {
  const chatId = msg.chat.id.toString();
  const senderId = msg.from.id;

  if (msg.chat.type === 'private') {
      return bot.sendMessage(chatId, `<blockquote>❌ Perintah ini hanya bisa digunakan di grup.</blockquote>`, {
    parse_mode: "HTML"
    });
  }

  try {
    
    const admins = await bot.getChatAdministrators(chatId);
    const isAdmin = admins.some(admin => admin.user.id === senderId);
      if (!isAdmin) {
      return bot.sendMessage(chatId, `<blockquote>❌ Hanya admin grup yang bisa mengatur AntiLink.</blockquote>`, {
    parse_mode: "HTML"
    });
  }

    const status = match[1] ? match[1].toLowerCase() : null;

    if (status === 'on') {
      antilink[chatId] = true;
      fs.writeFileSync(dbAntiLink, JSON.stringify(antilink, null, 2));
      return bot.sendMessage(chatId, `<blockquote>✅ AntiLink aktif di grup ini.</blockquote>`, {
    parse_mode: "HTML"
    });
      } else if (status === 'off') {
        delete antilink[chatId];
        fs.writeFileSync(dbAntiLink, JSON.stringify(antilink, null, 2));
        return bot.sendMessage(chatId, `<blockquote>✅ AntiLink dimatikan di grup ini.</blockquote>`, {
    parse_mode: "HTML"
    });
      } else {
        return bot.sendMessage(chatId, `<blockquote>📌 Gunakan:\n/antilink on\n/antilink off</blockquote>`, {
    parse_mode: "HTML"
    });
  }
    } catch (err) {
      console.error('[ANTILINK CMD ERROR]', err);
      bot.sendMessage(chatId, `<blockquote>❌ Terjadi kesalahan saat mengatur AntiLink.</blockquote>`, {
    parse_mode: "HTML"
    });
  }
});

bot.on('message', async (msg) => {
  const chatId = msg.chat.id.toString();
  const text = msg.text || '';

  if (antilink[chatId]) {
    const linkPattern = /(https?:\/\/|t\.me\/|telegram\.me\/|chat\.whatsapp\.com|wa\.me\/)/i;

    if (linkPattern.test(text)) {
      const admins = await bot.getChatAdministrators(chatId);
      const isAdmin = admins.some(admin => admin.user.id === msg.from.id);

      if (!isAdmin) {
        try {
          await bot.deleteMessage(chatId, msg.message_id);
        } catch (e) {
          console.error('❌ Gagal hapus pesan:', e.message);
        }
      }
    }
  }
});

//===================== MORE =====================

bot.onText(/^\/cekkodam(?: (.+))?/, async (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const nama = (match[1] || '').trim();

  try {
    const member = await bot.getChatMember(GROUP_ID, userId);
    if (member.status === 'left' || member.status === 'kicked') {
      return bot.sendMessage(chatId, `<blockquote>🚫 Kamu harus join channel official dulu supaya bisa pakai fitur ini.</blockquote>`, {
      parse_mode: "HTML", reply_markup: { inline_keyboard: [[{ text: "📢 Channel Official", url: GROUP_LINK }]] }
      });
    }

    if (!nama) {
      return bot.sendMessage(chatId, `<blockquote>🤓 Namanya mana anjeng? ketik /cekkhodam nama</blockquote>`, { 
      parse_mode: 'HTML' 
      });
    }

    if (!cekKhodam.length) {
      return bot.sendMessage(chatId, `⚠️ List khodam kosong / gagal dimuat dari Database.`, {
      parse_mode: "HTML"
      });
    }

    const hasil = `<blockquote><b>𖤐 ʜᴀsɪʟ ᴄᴇᴋ ᴋʜᴏᴅᴀᴍ:</b>
╭───────────────────────
├ • ɴᴀᴍᴀ : ${nama}
├ • ᴋʜᴏᴅᴀᴍɴʏᴀ : ${pickRandom(cekKhodam)}
├ • ɴɢᴇʀɪ ʙᴇᴛ ᴊɪʀ ᴋʜᴏᴅᴀᴍɴʏᴀ
╰────────────────────────
<b>ɴᴇxᴛ ᴄᴇᴋ ᴋʜᴏᴅᴀᴍɴʏᴀ sɪᴀᴘᴀ ʟᴀɢɪ.</b>
</blockquote>`;

    bot.sendMessage(chatId, hasil, { parse_mode: 'HTML' });
  } catch (error) {
    console.error("❌ Error cek khodam:", error);
    bot.sendMessage(chatId, `<blockquote>⚠️ Terjadi kesalahan saat cek khodam. Coba lagi nanti.</blockquote>`, {
    parse_mode: "HTML"
    });
  }
});

bot.onText(/^\/cektampan$/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  try {
    const member = await bot.getChatMember(GROUP_ID, userId);
    const status = member.status;

    if (status === 'left' || status === 'kicked') {
      return bot.sendMessage(chatId, `<blockquote>🚫 Kamu harus join channel official dulu supaya bisa pakai fitur ini.</blockquote>`, {
      parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [[
            { text: "Channel Official", url: GROUP_LINK }
          ]]
        }
      });
    }

  const nilai = [10, 20, 30, 35, 45, 50, 54, 68, 73, 78, 83, 90, 94, 100][Math.floor(Math.random() * 14)];
  const teks = `<blockquote><b>📊 HASIL TES KETAMPANAN</b>
<b>👤 Nama: ${msg.from.first_name}</b>
<b>💯 Nilai: ${nilai}%</b>
<b>🗣️ Komentar: ${komentarTampan(nilai)}</b>
</blockquote>`;
  bot.sendMessage(chatId, teks, { parse_mode: 'HTML' });
  } catch (error) {
    console.error(error);
    bot.sendMessage(chatId, `<blockquote>❌ Terjadi kesalahan saat pengecekan status keanggotaan grup/channel.</blockquote>`, {
    parse_mode: "HTML"
    });
  }
});

bot.onText(/^\/cekcantik$/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  try {
    const member = await bot.getChatMember(GROUP_ID, userId);
    const status = member.status;

    if (status === 'left' || status === 'kicked') {
      return bot.sendMessage(chatId, `<blockquote>🚫 Kamu harus join channel official dulu supaya bisa pakai fitur ini.</blockquote>`, {
      parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [[
            { text: "Channel Official", url: GROUP_LINK }
          ]]
        }
      });
    }
  const nilai = [10, 20, 30, 35, 45, 50, 54, 68, 73, 78, 83, 90, 94, 100][Math.floor(Math.random() * 14)];
  const teks = `<blockquote><b>📊 HASIL TES KECANTIKAN</b>
<b>👤 Nama: ${msg.from.first_name}</b>
<b>💯 Nilai: ${nilai}%</b>
<b>🗣️ Komentar: ${komentarCantik(nilai)}</b>
</blockquote>`.trim();

  bot.sendMessage(chatId, teks, { parse_mode: 'HTML' });
  } catch (error) {
    bot.sendMessage(chatId, `<blockquote>❌ Terjadi kesalahan saat pengecekan status keanggotaan grup/channel.</blockquote>`, {
    parse_mode: "HTML"
    });
  }
});

bot.onText(/^\/cekkaya$/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  try {
    const member = await bot.getChatMember(GROUP_ID, userId);
    const status = member.status;

    if (status === 'left' || status === 'kicked') {
      return bot.sendMessage(chatId, `<blockquote>🚫 Kamu harus join channel official dulu supaya bisa pakai fitur ini.</blockquote>`, {
      parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [[
            { text: "Channel Official", url: GROUP_LINK }
          ]]
        }
      });
    }
  const nilai = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100][Math.floor(Math.random() * 10)];
  const teks = `<blockquote><b>💵 HASIL TES KEKAYAAN</b>
<b>👤 Nama: ${msg.from.first_name}</b>
<b>💰 Nilai: ${nilai}%</b>
<b>🗣️ Komentar: ${komentarKaya(nilai)}</b>
</blockquote>`.trim();

  bot.sendMessage(chatId, teks, { parse_mode: 'HTML' });
  } catch (error) {
    bot.sendMessage(chatId, `<blockquote>❌ Terjadi kesalahan saat pengecekan status keanggotaan grup/channel.</blockquote>`, {
    parse_mode: "HTML"
    });
  }
});

bot.onText(/^\/cekmiskin$/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  try {
    const member = await bot.getChatMember(GROUP_ID, userId);
    const status = member.status;

    if (status === 'left' || status === 'kicked') {
      return bot.sendMessage(chatId, `<blockquote>🚫 Kamu harus join channel official dulu supaya bisa pakai fitur ini.</blockquote>`, {
      parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [[
            { text: "Channel Official", url: GROUP_LINK }
          ]]
        }
      });
    }
  const nilai = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100][Math.floor(Math.random() * 10)];
  const teks = `<blockquote><b>📉 HASIL TES KEMISKINAN</b>
<b>👤 Nama: ${msg.from.first_name}</b>
<b>📉 Nilai: ${nilai}%</b>
<b>🗣️ Komentar: ${komentarMiskin(nilai)}</b>
</blockquote>`.trim();

  bot.sendMessage(chatId, teks, { parse_mode: 'HTML' });
  } catch (error) {
    bot.sendMessage(chatId, `<blockquote>❌ Terjadi kesalahan saat pengecekan status keanggotaan grup/channel.</blockquote>`, {
    parse_mode: "HTML"
    });
  }
});

bot.onText(/^\/cekjanda$/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  try {
    const member = await bot.getChatMember(GROUP_ID, userId);
    const status = member.status;

    if (status === 'left' || status === 'kicked') {
      return bot.sendMessage(chatId, `<blockquote>🚫 Kamu harus join channel official dulu supaya bisa pakai fitur ini.</blockquote>`, {
      parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [[
            { text: "Channel Official", url: GROUP_LINK }
          ]]
        }
      });
    }
  const nilai = Math.floor(Math.random() * 101);
  const teks = `<blockquote><b>👠 HASIL TES KEJANDAAN</b>
<b>👤 Nama: ${msg.from.first_name}</b>
<b>📊 Nilai: ${nilai}%</b>
<b>🗣️ Komentar: ${komentarJanda(nilai)}</b>
</blockquote>`.trim();

  bot.sendMessage(chatId, teks, { parse_mode: 'HTML' });
  } catch (error) {
    bot.sendMessage(chatId, `<blockquote>❌ Terjadi kesalahan saat pengecekan status keanggotaan grup/channel.</blockquote>`, {
    parse_mode: "HTML"
    });
  }
});

bot.onText(/^\/cekpacar$/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  try {
    const member = await bot.getChatMember(GROUP_ID, userId);
    const status = member.status;

    if (status === 'left' || status === 'kicked') {
      return bot.sendMessage(chatId, `<blockquote>🚫 Kamu harus join channel official dulu supaya bisa pakai fitur ini.</blockquote>`, {
      parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [[
            { text: "Channel Official", url: GROUP_LINK }
          ]]
        }
      });
    }
  const nilai = Math.floor(Math.random() * 101);
  const teks = `<blockquote><b>💕 HASIL TES KEPACARAN</b>
<b>👤 Nama: ${msg.from.first_name}</b>
<b>📊 Nilai: ${nilai}%</b>
<b>🗣️ Komentar: ${komentarPacar(nilai)}</b>
</blockquote>`.trim();

  bot.sendMessage(chatId, teks, { parse_mode: 'HTML' });
  } catch (error) {
    bot.sendMessage(chatId, `<blockquote>❌ Terjadi kesalahan saat pengecekan status keanggotaan grup/channel.</blockquote>`, {
    parse_mode: "HTML"
    });
  }
});

bot.onText(/^\/ceksabar$/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  try {
    const member = await bot.getChatMember(GROUP_ID, userId);
    const status = member.status;

    if (status === 'left' || status === 'kicked') {
      return bot.sendMessage(chatId, `<blockquote>🚫 Kamu harus join channel official dulu supaya bisa pakai fitur ini.</blockquote>`, {
      parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [[
            { text: "Channel Official", url: GROUP_LINK }
          ]]
        }
      });
    }
  const nilai = Math.floor(Math.random() * 101);
  const teks = `<blockquote><b>💕 HASIL TES KESABARAN</b>
<b>👤 Nama: ${msg.from.first_name}</b>
<b>📊 Nilai: ${nilai}%</b>
<b>🗣️ Komentar: ${komentarSabar(nilai)}</b>
</blockquote>`.trim();

  bot.sendMessage(chatId, teks, { parse_mode: 'HTML' });
  } catch (error) {
    bot.sendMessage(chatId, `<blockquote>❌ Terjadi kesalahan saat pengecekan status keanggotaan grup/channel.</blockquote>`, {
    parse_mode: "HTML"
    });
  }
});

bot.onText(/^\/cektolol$/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  try {
    const member = await bot.getChatMember(GROUP_ID, userId);
    const status = member.status;

    if (status === 'left' || status === 'kicked') {
      return bot.sendMessage(chatId, `<blockquote>🚫 Kamu harus join channel official dulu supaya bisa pakai fitur ini.</blockquote>`, {
      parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [[
            { text: "Channel Official", url: GROUP_LINK }
          ]]
        }
      });
    }
  const nilai = Math.floor(Math.random() * 101);
  const teks = `<blockquote><b>💕 HASIL TES KETOLOLAN</b>
<b>👤 Nama: ${msg.from.first_name}</b>
<b>📊 Nilai: ${nilai}%</b>
<b>🗣️ Komentar: ${komentarTolol(nilai)}</b>
</blockquote>`.trim();

  bot.sendMessage(chatId, teks, { parse_mode: 'HTML' });
  } catch (error) {
    bot.sendMessage(chatId, `<blockquote>❌ Terjadi kesalahan saat pengecekan status keanggotaan grup/channel.</blockquote>`, {
    parse_mode: "HTML"
    });
  }
});

bot.onText(/^\/cekmati$/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  try {
    const member = await bot.getChatMember(GROUP_ID, userId);
    const status = member.status;

    if (status === 'left' || status === 'kicked') {
      return bot.sendMessage(chatId, `<blockquote>🚫 Kamu harus join channel official dulu supaya bisa pakai fitur ini.</blockquote>`, {
      parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [[
            { text: "Channel Official", url: GROUP_LINK }
          ]]
        }
      });
    }
  const nilai = Math.floor(Math.random() * 101);
  const teks = `<blockquote><b>💕 HASIL TES KETOLOLAN</b>
<b>👤 Nama: ${msg.from.first_name}</b>
<b>📊 Nilai: ${nilai}%</b>
<b>🗣️ Komentar: ${komentarMati(nilai)}</b>
</blockquote>`.trim();

  bot.sendMessage(chatId, teks, { parse_mode: 'HTML' });
  } catch (error) {
    bot.sendMessage(chatId, `<blockquote>❌ Terjadi kesalahan saat pengecekan status keanggotaan grup/channel.</blockquote>`, {
    parse_mode: "HTML"
    });
  }
});