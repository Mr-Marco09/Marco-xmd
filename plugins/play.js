const axios = require("axios");
const yts = require("yt-search");
const config = require("../config.json");

module.exports = {
    name: "song",
    alias: ["play"],
    category: "download",
    desc: "Télécharger de la musique YouTube",
    async execute(conn, mek, args) {
        const from = mek.key.remoteJid;
        const q = args.join(" ");
        
        if (!q) return conn.sendMessage(from, { text: "❌ Donne-moi un titre ou un lien YouTube !" }, { quoted: mek });

        try {
            // Recherche YouTube
            const search = await yts(q);
            const video = search.videos[0];
            if (!video) return conn.sendMessage(from, { text: "❌ Aucun résultat." });

            const apiUrl = `https://www.laksidunimsara.com{encodeURIComponent(video.url)}&api_key=Lk8*Vf3!sA1pZ6Hd`;
            const response = await axios.get(apiUrl);
            
            if (response.data.status !== "success") return conn.sendMessage(from, { text: "❌ Erreur API." });

            const downloadUrl = response.data.download;

            // Envoi du message avec le choix
            const desc = `🎵 *${video.title}*\n\n1️⃣ Audio (MP3)\n2️⃣ Document\n3️⃣ Note vocale\n\n*Réponds avec le chiffre.*`;
            
            await conn.sendMessage(from, { 
                image: { url: video.thumbnail }, 
                caption: desc 
            }, { quoted: mek });

            // Note : Pour gérer la réponse proprement (1, 2, ou 3), 
            // il est préférable d'utiliser un gestionnaire de réponses (Reply Handler) 
            // dans ton events.js plutôt que de créer un .on() ici.

        } catch (e) {
            console.error(e);
            conn.sendMessage(from, { text: "❌ Erreur lors du traitement." });
        }
    }
};
