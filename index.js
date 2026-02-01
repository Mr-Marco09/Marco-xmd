const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    makeCacheableSignalKeyStore, 
    DisconnectReason,
    fetchLatestWaWebVersion,
    Browsers
} = require("@whiskeysockets/baileys");
const pino = require("pino");
const express = require("express");
const path = require("path");
const config = require("./config.json");

const app = express();
const PORT = process.env.PORT || 3000;
const LOGO = "https://i.postimg.cc/3xJSspfc/freepik_a_professional_cybersecurity_logo_with_a_person_we_53896.jpg";

let marco = null;

// Servir le fichier HTML
app.get('/', (req, res) => { res.sendFile(path.join(__dirname, '/index.html')); });

// Route de Pairing corrigée
app.get('/pair', async (req, res) => {
    let num = req.query.number;
    if (!num) return res.status(400).json({ error: "Numéro manquant" });
    if (!marco) return res.status(503).json({ error: "Le bot n'est pas encore prêt. Attendez 10 secondes." });
    
    try {
        num = num.replace(/[^0-9]/g, '');
        const code = await marco.requestPairingCode(num);
        res.json({ code: code });
    } catch (err) {
        console.error("Erreur de pairing :", err);
        res.status(500).json({ error: "Erreur lors de la génération du code" });
    }
});

async function startMarco() {
    const { state, saveCreds } = await useMultiFileAuthState('session');
    const { version } = await fetchLatestWaWebVersion().catch(() => ({ version: [2, 3000, 1015901307] }));

    marco = makeWASocket({
        version,
        logger: pino({ level: "fatal" }),
        printQRInTerminal: false,
        browser: Browsers.ubuntu("Chrome"),
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" })),
        },
        connectTimeoutMs: 60000,
        defaultQueryTimeoutMs: 0,
    });

    marco.ev.on('creds.update', saveCreds);

    marco.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        
        if (connection === 'open') {
            console.log("✅ Connecté !");
            const msg = `🚀 *${config.botName}* connecté !\nDev: ${config.ownerName}\nMode: ${config.privateMode ? 'Privé' : 'Public'}`;
            await marco.sendMessage(config.ownerNumber + "@s.whatsapp.net", { image: { url: LOGO }, caption: msg });
        }

        if (connection === 'close') {
            const reason = lastDisconnect?.error?.output?.statusCode;
            if (reason !== DisconnectReason.loggedOut) {
                console.log("Reconnexion...");
                setTimeout(startMarco, 5000);
            }
        }
    });

    // --- LOGIQUE MESSAGES ---
    marco.ev.on('messages.upsert', async m => {
        const msg = m.messages[0];
        if (!msg || !msg.message || msg.key.fromMe) return;

        const from = msg.key.remoteJid;
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text || "";

        if (config.privateMode && from !== config.ownerNumber + "@s.whatsapp.net") return;

        if (text.startsWith(".")) {
            await marco.sendMessage(from, { react: { text: "⚡", key: msg.key } });
        }

        if (text.startsWith(".play")) {
            await marco.sendMessage(from, { image: { url: LOGO }, caption: "⏳ Téléchargement..." });
        }
    });

    // --- LOGIQUE GROUPE ---
    marco.ev.on('group-participants.update', async (anu) => {
        try {
            const participant = anu.participants[0];
            if (anu.action === 'add') {
                await marco.sendMessage(anu.id, { 
                    image: { url: LOGO }, 
                    caption: `Bienvenue @${participant.split('@')[0]}`, 
                    mentions: [participant] 
                });
            }
        } catch (e) { console.log(e); }
    });
}

app.listen(PORT, () => console.log(`Serveur Web sur le port ${PORT}`));
startMarco().catch(err => console.error("Erreur de démarrage :", err));
