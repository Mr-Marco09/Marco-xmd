const config = require("../config.json");
const os = require("os");

module.exports = {
    name: "menu",
    alias: ["help", "aide", "h"],
    category: "main",
    desc: "Affiche la liste des commandes et les infos du bot",
    async execute(conn, mek, args) {
        const from = mek.key.remoteJid;
        
        // Calcul du temps d'activité (Uptime)
        const uptime = process.uptime();
        const hours = Math.floor(uptime / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = Math.floor(uptime % 60);

        let menuText = `
╔═════✦⭒❖⭒✦═════╗
   🤖 *${config.botName.toUpperCase()}* 🤖
╚═════✦⭒❖⭒✦═════╝

👤 *Proprio :* ${config.ownerName}
📍 *Région :* ${config.region}
⚡ *Prefix :* [ ${config.prefix} ]
⏳ *Uptime :* ${hours}h ${minutes}m ${seconds}s
💾 *RAM :* ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB / 512 MB

╔═════✦⭒❖⭒✦═════╗
   📂 *COMMANDES DISPO* 📂
╚═════✦⭒❖⭒✦═════╝

🎵 *Download :*
│ ➩ .play (Titre/Lien)
│ ➩ .video (Titre/Lien)
│ ➩ .song (Alias)

🛠️ *Outils :*
│ ➩ .menu (Affiche ceci)
│ ➩ .ping (Vitesse du bot)

📢 *Canal Officiel :*
${config.chanelLink}

> * © by Mr Marco* 🛡️
`;

        try {
            await conn.sendMessage(from, {
                image: { url: config.botLogo },
                caption: menuText,
                contextInfo: {
                    externalAdReply: {
                        title: config.botName,
                        body: "WhatsApp Bot Multi-Device",
                        thumbnailUrl: config.botLogo,
                        sourceUrl: config.channelLink,
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                }
            }, { quoted: mek });
        } catch (e) {
            console.error(e);
            conn.sendMessage(from, { text: menuText }, { quoted: mek });
        }
    }
};
