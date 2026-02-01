const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    delay, 
    makeCacheableSignalKeyStore,
    DisconnectReason,
    fetchLatestWaWebVersion // INDISPENSABLE pour corriger l'erreur GraphQL
} = require("@whiskeysockets/baileys");
const pino = require("pino");
const express = require("express");
const path = require("path");
const fs = require("fs");
const config = require("./config.json");

const app = express();
const PORT = process.env.PORT || 3000;

const LOGO = "https://i.postimg.cc";

let marco; // DÉCLARATION GLOBALE : Empêche les crashs de session

app.get('/', (req, res) => { res.sendFile(path.join(__dirname, '/index.html')); });

// LOGIQUE DE PAIRING (Placée ici pour être stable)
app.get('/pair', async (req, res) => {
    let num = req.query.number;
    if (!num) return res.json({ error: "Numéro manquant" });
    if (!marco) return res.json({ error: "Le bot n'est pas encore prêt, attendez 5 secondes" });
    try {
        num = num.replace(/[^0-9]/g, '');
        let code = await marco.requestPairingCode(num);
        res.json({ code: code });
    } catch (err) {
        console.error(err);
        res.json({ error: "Erreur serveur lors du jumelage" });
    }
});

async function startMarco() {
    const { state, saveCreds } = await useMultiFileAuthState('session');
    
    // CORRECTION : Récupération de la version réelle de WhatsApp Web
    const { version } = await fetchLatestWaWebVersion().catch(() => ({ version: [2, 3000, 1015901307] }));

    marco = makeWASocket({
        version, // Applique la version corrigée
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" })),
        },
        printQRInTerminal: false,
        logger: pino({ level: "fatal" }),
        browser: ["Chrome (Linux)", "Chrome", "110.0.5481.178"] // Navigateur plus stable
    });

    marco.ev.on('creds.update', saveCreds);

    marco.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        
        if (connection === 'open') {
            console.log("✅ Connecté avec succès !");
            await marco.sendMessage(config.ownerNumber + "@s.whatsapp.net", { 
                image: { url: LOGO }, 
                caption: `🚀 *${config.botName}* connecté !\nDev: ${config.ownerName}\nMode: ${config.privateMode ? 'Privé' : 'Public'}` 
            });
            await marco.newsletterFollow("0029VbASWFzHFxP6cbTkkz08");
        }

        // CORRECTION DE LA DÉCONNEXION AUTOMATIQUE
        if (connection === 'close') {
            const reason = lastDisconnect?.error?.output?.statusCode;
            console.log("❌ Connexion fermée, raison :", reason);
            
            if (reason !== DisconnectReason.loggedOut) {
                console.log("Tentative de reconnexion dans 5 secondes...");
                setTimeout(() => startMarco(), 5000); // Délai de sécurité
            } else {
                console.log("Déconnecté manuellement. Supprimez le dossier 'session' sur Render.");
            }
        }
    });

    // --- TES LOGIQUES DE MESSAGES (PRÉSERVÉES) ---
    marco.ev.on('messages.upsert', async m => {
        const msg = m.messages[0];
        if (!msg || !msg.message || msg.key.fromMe) return;

        const from = msg.key.remoteJid;
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text || "";
        
        if(config.privateMode && msg.key.remoteJid !== config.ownerNumber + "@s.whatsapp.net") return;

        await marco.sendMessage(from, { react: { text: "⚡", key: msg.key } });

        if(text.startsWith(".play")) {
            await marco.sendMessage(from, { 
                image: { url: LOGO }, 
                caption: "⏳ Téléchargement de votre musique via Marco XMD..." 
            });
        }
    });

    // --- TES LOGIQUES DE GROUPE (PRÉSERVÉES) ---
    marco.ev.on('group-participants.update', async (anu) => {
        try {
            const metadatas = await marco.groupMetadata(anu.id);
            const participant = anu.participants[0];
            if (anu.action == 'add') {
                await marco.sendMessage(anu.id, { 
                    image: { url: LOGO },
                    caption: `Bienvenue @${participant.split('@')[0]} dans ${metadatas.subject}`, 
                    mentions: [participant] 
                });
            } else if (anu.action == 'remove') {
                await marco.sendMessage(anu.id, { 
                    text: `Au revoir @${participant.split('@')[0]}...`, 
                    mentions: [participant] 
                });
            }
        } catch (e) { console.log("Erreur GroupUpdate:", e); }
    });
}

app.listen(PORT, () => console.log(`Serveur Web Marco XMD sur port ${PORT}`));
startMarco();
