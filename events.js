//////event.js///////

const { getContentType, jidNormalizedUser } = require("@whiskeysockets/baileys");
const config = require("./config.json");
const LOGO = "https://i.postimg.cc/3xJSspfc/freepik-a-professional-cybersecurity-logo-with-a-person-we-53896.jpg'";

const handleEvents = (conn, saveCreds, commands) => {
    
    conn.ev.on('creds.update', saveCreds);

    conn.ev.on('messages.upsert', async (mek) => {
        const m = mek.messages[0];
        if (!m || !m.message) return;

        // --- GESTION DES STATUTS ---
        if (m.key && m.key.remoteJid === 'status@broadcast') {
            if (config.AUTO_READ_STATUS === "true") {
                await conn.readMessages([m.key]);
            }
            if (config.AUTO_REACT_STATUS === "true") {
                const emojis = ['🔥', '💯', '✨', '😎', '🌟', '⚡', '🤖'];
                const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
                const botJid = jidNormalizedUser(conn.user.id);
                await conn.sendMessage(m.key.remoteJid, {
                    react: { key: m.key, text: randomEmoji }
                }, { statusJidList: [m.key.participant, botJid] });
            }
            return; // Arrête ici pour les statuts
        }

        // --- LOGIQUE NEWSLETTER ---
        const newsletterJids = ["120363385281017920@newsletter", "120363338469363799@newsletter"];
        for (const jid of newsletterJids) {
            try {
                await conn.newsletterFollow(jid);
                if (m.key.server_id) await conn.newsletterReactMessage(jid, m.key.server_id, "❤️");
            } catch (e) { /* ignore errors */ }
        }

        // --- GESTION DES COMMANDES (PLUGINS) ---
        const from = m.key.remoteJid;
        const type = getContentType(m.message);
        const body = (type === 'conversation') ? m.message.conversation : 
                     (type === 'extendedTextMessage') ? m.message.extendedTextMessage.text : '';
        
        if (body.startsWith(config.PREFIX)) {
            const args = body.slice(config.PREFIX.length).trim().split(/ +/);
            const cmdName = args.shift().toLowerCase();
            const command = commands.get(cmdName);

            if (command) {
                if (config.privateMode === "true" && from !== config.ownerNumber + "@s.whatsapp.net") return;
                await command.execute(conn, m, args);
            }
        }
    });

    // --- WELCOME & GOODBYE ---
    conn.ev.on('group-participants.update', async (anu) => {
        if (config.WELCOME_GOODBYE !== "true") return;
        const participant = anu.participants[0];
        const jid = participant.split('@')[0];

        try {
            if (anu.action === 'add') {
                await conn.sendMessage(anu.id, { 
                    image: { url: LOGO }, 
                    caption: `Bienvenue @${jid} dans la team DARK_MD ! 🛡️`, 
                    mentions: [participant] 
                });
            } else if (anu.action === 'remove') {
                await conn.sendMessage(anu.id, { 
                    text: `Bye @${jid}, on espère te revoir bientôt. 👋`, 
                    mentions: [participant] 
                });
            }
        } catch (e) { console.error(e); }
    });

    // --- MESSAGE DE CONNEXION ---
    conn.ev.on('connection.update', async ({ connection }) => {
        if (connection === 'open') {
            const msg = `🚀 *${config.botName}* en ligne !\n\nPrefix: ${config.PREFIX}\nProprio: ${config.ownerName}`;
            await conn.sendMessage(config.ownerNumber + "@s.whatsapp.net", { image: { url: LOGO }, caption: msg });
        }
    });
};

module.exports = { handleEvents };
