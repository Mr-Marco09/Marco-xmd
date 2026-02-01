///////plugins/ping.js/////
const config = require("../config.json");

module.exports = {
    name: "ping",
    description: "Vérifie la latence du bot",
    async execute(conn, m, args) {
        const from = m.key.remoteJid;
        
        // Calcul de la latence
        const start = Date.now();
        const firstMsg = await conn.sendMessage(from, { text: "Calcul en cours..." }, { quoted: m });
        const end = Date.now();
        const latency = end - start;

        // Mise à jour du message avec le temps de réponse
        await conn.sendMessage(from, { 
            text: `*🏓 Pong !*\n\n🚀 Vitesse : *${latency}ms*\n🤖 Bot : *${config.botName}*`,
            edit: firstMsg.key 
        });
    }
};
