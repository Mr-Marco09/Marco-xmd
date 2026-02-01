////plugins/play.js//////

const yts = require('yt-search');
const config = require("../config.json");

module.exports = {
    name: "play",
    description: "Télécharge une musique depuis YouTube",
    async execute(conn, m, args) {
        const from = m.key.remoteJid;
        const text = args.join(" ");

        if (!text) return await conn.sendMessage(from, { text: `⚠️ Veuillez préciser le nom d'une musique.\nExemple : *${config.prefix}play Imagine Dragons Believer*` });

        try {
            // Réaction de chargement
            await conn.sendMessage(from, { react: { text: "⏳", key: m.key } });

            // Recherche sur YouTube
            const search = await yts(text);
            const video = search.videos[0];

            if (!video) return await conn.sendMessage(from, { text: "❌ Musique non trouvée." });

            const infoMsg = `🎧 *${config.botName.toUpperCase()} PLAYER* 🎧\n\n` +
                            `📝 *Titre :* ${video.title}\n` +
                            `⏱️ *Durée :* ${video.timestamp}\n` +
                            `👤 *Chaîne :* ${video.author.name}\n` +
                            `🔗 *Lien :* ${video.url}\n\n` +
                            `> 🔄 Envoi de l'audio en cours...`;

            // Envoi de la miniature et des infos
            await conn.sendMessage(from, { 
                image: { url: video.thumbnail }, 
                caption: infoMsg 
            }, { quoted: m });

            // ENVOI DE L'AUDIO
            // Note : L'URL ci-dessous est un exemple d'API. Assure-toi qu'elle est fonctionnelle.
            await conn.sendMessage(from, { 
                audio: { url: `https://api.vyt-loader.xyz{video.url}` }, 
                mimetype: 'audio/mp4',
                ptt: false
            }, { quoted: m });

            await conn.sendMessage(from, { react: { text: "✅", key: m.key } });

        } catch (error) {
            console.error("Erreur Play:", error);
            await conn.sendMessage(from, { text: "❌ Une erreur est survenue. L'API de téléchargement est peut-être hors ligne." });
        }
    }
};
