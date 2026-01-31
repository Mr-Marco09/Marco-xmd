////index.js corriger////
const { default: makeWASocket, useMultiFileAuthState, delay, makeCacheableSignalKeyStore } = require("@whiskeysockets/baileys");
const pino = require("pino");
const express = require("express");
const path = require("path");
const fs = require("fs");
const config = require("./config.json");

const app = express();
const PORT = process.env.PORT || 3000;

// Ton lien logo direct
const LOGO = "https://postimg.cc/rK3NWdk1";

app.get('/', (req, res) => { res.sendFile(path.join(__dirname, '/index.html')); });

async function startMarco() {
    const { state, saveCreds } = await useMultiFileAuthState('session');
    
    const marco = makeWASocket({
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" })),
        },
        printQRInTerminal: false,
        logger: pino({ level: "fatal" }),
        browser: ["Ubuntu", "Chrome", "20.0.04"]
    });

    app.get('/pair', async (req, res) => {
        let num = req.query.number;
        if (!num) return res.json({ error: "Numéro manquant" });
        try {
            let code = await marco.requestPairingCode(num);
            res.json({ code: code });
        } catch (err) {
            res.json({ error: "Erreur serveur" });
        }
    });

    marco.ev.on('creds.update', saveCreds);

    marco.ev.on('connection.update', async (update) => {
        const { connection } = update;
        if (connection === 'open') {
            console.log("Connecté avec succès !");
            // Ajout du logo dans le message de démarrage
            await marco.sendMessage(config.ownerNumber + "@s.whatsapp.net", { 
                image: { url: LOGO }, 
                caption: `🚀 *${config.botName}* connecté !\nDev: ${config.ownerName}\nMode: ${config.privateMode ? 'Privé' : 'Public'}` 
            });
            await marco.newsletterFollow("0029VbASWFzHFxP6cbTkkz08");
        }
        if (connection === 'close') startMarco(); 
    });

    marco.ev.on('messages.upsert', async m => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const from = msg.key.remoteJid;
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text || "";
        
        if(config.privateMode && msg.key.remoteJid !== config.ownerNumber + "@s.whatsapp.net") return;

        await marco.sendMessage(from, { react: { text: "⚡", key: msg.key } });

        if(text.startsWith(".play")) {
            // Ajout du logo dans la réponse de commande
            await marco.sendMessage(from, { 
                image: { url: LOGO }, 
                caption: "⏳ Téléchargement de votre musique via Marco XMD..." 
            });
        }
    });

    marco.ev.on('group-participants.update', async (anu) => {
        const metadatas = await marco.groupMetadata(anu.id);
        if (anu.action == 'add') {
            // Ajout du logo dans le message de bienvenue
            marco.sendMessage(anu.id, { 
                image: { url: LOGO },
                caption: `Bienvenue @${anu.participants[0].split('@')[0]} dans ${metadatas.subject}`, 
                mentions: [anu.participants[0]] 
            });
        } else if (anu.action == 'remove') {
            marco.sendMessage(anu.id, { text: `Au revoir @${anu.participants[0].split('@')[0]}...`, mentions: [anu.participants[0]] });
        }
    });
}

app.listen(PORT, () => console.log(`Serveur Web Marco XMD sur port ${PORT}`));
startMarco();
