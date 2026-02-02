const config = require("../config.json");

module.exports = {
    name: "menu",
    alias: ["h", "help", "aide"],
    category: "main",
    async execute(conn, mek, args) {
        const from = mek.key.remoteJid;
        
        // Calcul précis du Runtime
        const uptime = process.uptime();
        const runtime = `${Math.floor(uptime / 60)} minute, ${Math.floor(uptime % 60)} secondes`;

        let menuText = `
┏━━━━━━━━━━━━━━━━━━━━━━━━┓
┃   〔 *${config.botName.toUpperCase()}* 〕
┗━━━━━━━━━━━━━━━━━━━━━━━━┛
┌────────────────────────
┝  👤 *Owner:* ${config.ownerName}
┝  📦 *Commands:* 312
┝  ⏳ *Runtime:* ${runtime}
┝  🏗️ *Baileys:* Multi Device
┝  ☁️ *Platform:* Render
┝  🔘 *Prefix:* ${config.prefix}
┝  🔒 *Mode:* ${config.privateMode ? 'Private' : 'Public'}
┝  📜 *Version:* 1.0.0 BETA
└────────────────────────

┏━━━━━━━━━━━━━━━━━━━━━━━━┓
┃       「 *DOWNLOAD* 」
┗━━━━━━━━━━━━━━━━━━━━━━━━┛
┌────────────────────────
┝  ➩ .play (Audio/Musique)
┝  ➩ .video (Clip Vidéo)
┝  ➩ .song (Alias Musique)
└────────────────────────

┏━━━━━━━━━━━━━━━━━━━━━━━━┓
┃    「 *AI & TOOLS* 」
┗━━━━━━━━━━━━━━━━━━━━━━━━┛
┌────────────────────────
┝  ➩ .ping (Vitesse)
┝  ➩ .menu (Aide)
└────────────────────────

> *𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐌𝐑 𝐌𝐀𝐑𝐂𝐎* 🛡️
`;

        await conn.sendMessage(from, {
            text: menuText,
            contextInfo: {
                externalAdReply: {
                    title: `🛡️ ${config.botName.toUpperCase()} MULTI-DEVICE`,
                    body: `Best WhatsApp Bot from Haïti 🇭🇹`,
                    thumbnailUrl: config.botLogo,
                    sourceUrl: config.channelLink,
                    mediaType: 1,
                    renderLargerThumbnail: true // Pour l'effet bannière géante
                }
            }
        }, { quoted: mek });
    }
};
