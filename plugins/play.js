//////plugins/play.js////////

const yts = require('yt-search');

module.exports = {
    name: "play",
    description: "Télécharge une musique depuis YouTube",
    async execute(conn, m, args) {
        const from = m.key.remoteJid;
        const text = args.join(" ");

        if (!text) return await conn.sendMessage(from, { text: "⚠️ Veuillez préciser le nom d'une musique.\nExemple : *.play Imagine Dragons Believer*" });

        try {
            // Envoi de la réaction de chargement
            await conn.sendMessage(from, { react: { text: "⏳", key: m.key } });

            // Recherche sur YouTube
            const search = await yts(text);
            const video = search.videos[0];

            if (!video) return await conn.sendMessage(from, { text: "❌ Musique non trouvée." });

            const infoMsg = `🎧 *DARK_MD MUSIC PLAYER* 🎧\n\n` +
                            `📝 *Titre :* ${video.title}\n` +
                            `⏱️ *Durée :* ${video.timestamp}\n` +
                            `🔗 *Lien :* ${video.url}\n\n` +
                            `> Envoi de l'audio en cours...`;

            // Envoi de l'affiche et des infos
            await conn.sendMessage(from, { 
                image: { url: video.thumbnail }, 
                caption: infoMsg 
            });

            // ICI : Logique de téléchargement (via API ou librairie)
            // Exemple avec un lien de téléchargement direct ou un buffer
            await conn.sendMessage(from, { 
                audio: { url: `https://api.vyt-loader.xyz{video.url}` }, // Exemple d'API externe
                mimetype: 'audio/mp4',
                ptt: false
            }, { quoted: m });

            await conn.sendMessage(from, { react: { text: "✅", key: m.key } });

        } catch (error) {
            console.error(error);
            await conn.sendMessage(from, { text: "❌ Une erreur est survenue lors du téléchargement." });
        }
    }
};
