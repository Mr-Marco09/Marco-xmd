const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    delay, 
    makeCacheableSignalKeyStore, 
    DisconnectReason,
    fetchLatestWaWebVersion // AJOUTÉ : Pour éviter l'erreur GraphQL
} = require("@whiskeysockets/baileys");
const pino = require("pino");
const express = require("express");
const path = require("path");
const fs = require("fs");
const config = require("./config.json");

const app = express();
const PORT = process.env.PORT || 3000;

const LOGO = "https://i.postimg.cc/3xJSspfc/freepik_a_professional_cybersecurity_logo_with_a_person_we_53896.jpg";

let marco;

app.get('/', (req, res) => { res.sendFile(path.join(__dirname, '/index.html')); });

app.get('/pair', async (req, res) => {
    let num = req.query.number;
    if (!num) return res.json({ error: "Numéro manquant" });
    if (!marco) return res.json({ error: "Le bot n'est pas encore prêt" });
    try {
        num = num.replace(/[^0-9]/g, '');
        let code = await marco.requestPairingCode(num);
        res.json({ code: code });
    } catch (err) {
        console.error("Erreur Pairing:", err);
        res.json({ error: "Erreur serveur" });
    }
});

async function startMarco() {
    const { state, saveCreds } = await useMultiFileAuthState('session');
    
    // RÉCUPÉRATION DE LA VERSION (Corrige l'erreur GraphQL Bad Request)
    const { version } = await fetchLatestWaWebVersion();
    console.log(`Démarrage avec WhatsApp Web v${version.join('.')}`);

    marco = makeWASocket({
        version, // APPLIQUÉ ICI
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" })),
        },
        printQRInTerminal: false,
        logger: pino({ level: "fatal" }),
        // "Chrome" est souvent plus stable que "Ubuntu" pour le pairing
        browser: ["Chrome (Linux)", "Chrome", "110.0.5481.178"] 
    });

    marco.ev.on('creds.update', saveCreds);

    marco.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        
        if (connection === 'open') {
            console.log("✅ Marco XMD : Connecté !");
            await marco.sendMessage(config.ownerNumber + "@s.whatsapp.net", { 
                image: { url: LOGO }, 
                caption: `🚀 *${config.botName}* connecté !\nDev: ${config.ownerName}` 
            });
        }

        if (connection === 'close') {
            const reason = lastDisconnect?.error?.output?.statusCode;
            const shouldReconnect = reason !== DisconnectReason.loggedOut;
            console.log(`❌ Connexion fermée (Raison: ${reason}). Reconnexion: ${shouldReconnect}`);
            if (shouldReconnect) startMarco();
        }
    });

    marco.ev.on('messages.upsert', async m => {
        const msg = m.messages[0];
        if (!msg || !msg.message || msg.key.fromMe) return;
        const from = msg.key.remoteJid;
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text || "";
        
        if(config.privateMode && from !== config.ownerNumber + "@s.whatsapp.net") return;

        if (text.startsWith(".")) {
             await marco.sendMessage(from, { react: { text: "⚡", key: msg.key } });
        }

        if(text.startsWith(".play")) {
            await marco.sendMessage(from, { image: { url: LOGO }, caption: "⏳ Téléchargement..." });
        }
    });

    marco.ev.on('group-participants.update', async (anu) => {
        try {
            const metadatas = await marco.groupMetadata(anu.id);
            const jid = anu.participants[0];
            if (anu.action == 'add') {
                await marco.sendMessage(anu.id, { 
                    image: { url: LOGO },
                    caption: `Bienvenue @${jid.split('@')[0]}`, 
                    mentions: [jid] 
                });
            }
        } catch (e) { console.log(e); }
    });
}

app.listen(PORT, () => console.log(`Serveur prêt sur port ${PORT}`));
startMarco();
