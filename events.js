////////events.js////////////

const config = require("./config.json");
const LOGO = "https://i.postimg.cc";

const handleEvents = (marco, saveCreds) => {
    
    marco.ev.on('creds.update', saveCreds);

    // --- AUTO STATUS VIEW & REACT ---
    marco.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        if (!msg) return;

        // Auto Status View
        if (msg.key.remoteJid === 'status@broadcast' && config.autoStatusView === 'true') {
            await marco.readMessages([msg.key]);
        }

        // Auto React & Messages
        if (msg.message && !msg.key.fromMe) {
            const from = msg.key.remoteJid;
            // Ton système de plugins peut être appelé ici
            if (config.autoReact === 'true') {
                await marco.sendMessage(from, { react: { text: "⚡", key: msg.key } });
            }
        }
    });

    // --- WELCOME & GOODBYE ---
    marco.ev.on('group-participants.update', async (anu) => {
        const participant = anu.participants[0];
        if (anu.action === 'add') {
            await marco.sendMessage(anu.id, { image: { url: LOGO }, caption: `Bienvenue @${participant.split('@')[0]}`, mentions: [participant] });
        } else if (anu.action === 'remove') {
            await marco.sendMessage(anu.id, { text: `Bye @${participant.split('@')[0]}...`, mentions: [participant] });
        }
    });

    // --- MESSAGE DE CONNEXION ---
    marco.ev.on('connection.update', async ({ connection }) => {
        if (connection === 'open') {
            await marco.sendMessage(config.ownerNumber + "@s.whatsapp.net", { 
                image: { url: LOGO }, 
                caption: `🚀 *DARK_MD* est prêt !\nPropriétaire: ${config.ownerName}` 
            });
        }
    });
};

module.exports = { handleEvents };
