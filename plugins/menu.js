const config = require("../config.json");

module.exports = {
    name: "menu",
    alias: ["h", "help"],
    category: "main",
    async execute(conn, mek, args) {
        const from = mek.key.remoteJid;
        
        const uptime = process.uptime();
        const runtime = `${Math.floor(uptime / 60)} minute(s), ${Math.floor(uptime % 60)} seconde(s)`;

        let menuText = `╭━━━━━━〔 *${config.botName.toUpperCase()}* 〕━━━━━━┈⊷
┃ 👤 *Owner:* ${config.ownerName}
┃ 📦 *Commands:* 312
┃ ⏳ *Runtime:* ${runtime}
┃ 🏗️ *Baileys:* Multi Device
┃ ☁️ *Platform:* Render
┃ 🔘 *Prefix:* ${config.prefix}
┃ 🔒 *Mode:* ${config.privateMode ? 'Private' : 'Public'}
┃ 📜 *Version:* 1.0.0 BETA
╰━━━━━━━━━━━━━━━━━━━━━━┈⊷

「 *DOWNLOAD* 」
┌───────────────────
┝ ➩ .play (Audio/Musique)
┝ ➩ .video (Clip Vidéo)
┝ ➩ .song (Alias Musique)
└───────────────────

> *𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐌𝐑 𝐌𝐀𝐑𝐂𝐎* 🛡️`;

        await conn.sendMessage(from, {
            text: menuText,
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true, // Ajoute la flèche "Transféré" en haut
                externalAdReply: {
                    title: `🛡️ ${config.botName.toUpperCase()} - CANAL`,
                    body: `Cliquez pour rejoindre`,
                    thumbnailUrl: config.botLogo,
                    // --- CONFIGURATION DU BOUTON VERT ---
                    mediaType: 4, // 4 = Newsletter (Force le bouton "Voir la chaîne" en bas)
                    sourceUrl: config.channelLink,
                    renderLargerThumbnail: true,
                    newsletterJid: "120363233306161477@newsletter", // Simule l'ID du canal
                    newsletterName: config.botName
                }
            }
        }, { quoted: mek });
    }
};
