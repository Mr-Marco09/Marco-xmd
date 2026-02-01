///////event.js//////////

const { getContentType, jidNormalizedUser } = require("@whiskeysockets/baileys");
const config = require("./config.json");

// Correction de l'URL (on utilise celle du config.json directement)
const LOGO = config.botLogo;

const handleEvents = (conn, saveCreds, commands) => {
    
    conn.ev.on('creds.update', saveCreds);

    conn.ev.on('messages.upsert', async (mek) => {
        const m = mek.messages[0];
        if (!m || !m.message) return;

        // --- GESTION DES STATUTS (Désactivé par défaut si absent du JSON) ---
        if (m.key && m.key.remoteJid === 'status@broadcast') {
            if (config.AUTO_READ_STATUS === "true") {
                await conn.readMessages([m.key]);
            }
            return; 
        }

        // --- GESTION DES COMMANDES (PLUGINS) ---
        const from = m.key.remoteJid;
        const type = getContentType(m.message);
        const body = (type === 'conversation') ? m.message.conversation : 
                     (type === 'extendedTextMessage') ? m.message.extendedTextMessage.text : 
                     (type === 'imageMessage') ? m.message.imageMessage.caption : '';
        
        // CORRECTION : config.prefix au lieu de config.PREFIX
        if (body.startsWith(config.prefix)) {
            const args = body.slice(config.prefix.length).trim().split(/ +/);
            const cmdName = args.shift().toLowerCase();
            const command = commands.get(cmdName);

            if (command) {
                // CORRECTION : config.privateMode est un booléen dans ton JSON (pas une string)
                if (config.privateMode === true && from !== config.ownerNumber + "@s.whatsapp.net") return;
                await command.execute(conn, m, args);
            }
        }
    });

    // --- WELCOME & GOODBYE ---
    conn.ev.on('group-participants.update', async (anu) => {
        // Supprimé la condition config.WELCOME_GOODBYE car elle n'est pas dans ton JSON
        const participant = anu.participants[0];
        const jid = participant.split('@')[0];

        try {
            if (anu.action === 'add') {
                await conn.sendMessage(anu.id, { 
                    image: { url: LOGO }, 
                    caption: `Bienvenue @${jid} dans la team ${config.botName} ! 🛡️`, 
                    mentions: [participant] 
                });
            }
        } catch (e) { console.error("Erreur Welcome:", e); }
    });

    // --- MESSAGE DE CONNEXION ---
    conn.ev.on('connection.update', async ({ connection }) => {
        if (connection === 'open') {
            const msg = `🚀 *${config.botName}* en ligne !\n\nPrefix: ${config.prefix}\nProprio: ${config.ownerName}`;
            await conn.sendMessage(config.ownerNumber + "@s.whatsapp.net", { image: { url: LOGO }, caption: msg });
        }
    });
};

module.exports = { handleEvents };
