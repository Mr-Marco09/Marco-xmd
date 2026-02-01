//////plugins/ping.js//////////

module.exports = {
    name: "ping", // Le nom de la commande
    description: "Vérifie la latence du bot",
    async execute(marco, msg, args) {
        const from = msg.key.remoteJid;
        await marco.sendMessage(from, { text: "Pong! 🏓" });
    }
};
