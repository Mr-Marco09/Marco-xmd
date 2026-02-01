const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    makeCacheableSignalKeyStore, 
    DisconnectReason,
    fetchLatestWaWebVersion, // INDISPENSABLE
    Browsers // Pour un navigateur stable
} = require("@whiskeysockets/baileys");
const pino = require("pino");
const express = require("express");
const path = require("path");
const config = require("./config.json");

const app = express();
const PORT = process.env.PORT || 3000;
const LOGO = "https://i.postimg.cc";

let marco; 

app.get('/', (req, res) => { res.sendFile(path.join(__dirname, '/index.html')); });

app.get('/pair', async (req, res) => {
    let num = req.query.number;
    if (!num) return res.status(400).json({ error: "Numéro manquant" });
    if (!marco) return res.status(503).json({ error: "Serveur en cours de démarrage..." });
    try {
        num = num.replace(/[^0-9]/g, '');
        // On ajoute un léger délai pour laisser au socket le temps de se stabiliser
        await new Promise(resolve => setTimeout(resolve, 3000)); 
        let code = await marco.requestPairingCode(num);
        res.json({ code: code });
    } catch (err) {
        console.error("Erreur Pairing:", err);
        res.status(500).json({ error: "Échec du pairing. Réessayez." });
    }
});

async function startMarco() {
    const { state, saveCreds } = await useMultiFileAuthState('session');
    
    // Correction de l'erreur GraphQL : On récupère la version réelle de WA
    const { version } = await fetchLatestWaWebVersion().catch(() => ({ version: [2, 3000, 1017531287] }));

    marco = makeWASocket({
        version,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" })),
        },
        printQRInTerminal: false,
        logger: pino({ level: "fatal" }),
        browser: Browsers.ubuntu("Chrome"), // Utilise le format recommandé par Baileys
        markOnlineOnConnect: true,
        connectTimeoutMs: 60000,
        keepAliveIntervalMs: 30000
    });

    marco.ev.on('creds.update', saveCreds);

    marco.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        
        if (connection === 'open') {
            console.log("✅ Connecté !");
            await marco.sendMessage(config.ownerNumber + "@s.whatsapp.net", { 
                image: { url: LOGO }, 
                caption: `🚀 *${config.botName}* en ligne !` 
            });
        }

        if (connection === 'close') {
            const reason = lastDisconnect?.error?.output?.statusCode;
            console.log("❌ Déconnecté. Raison:", reason);
            // On ne relance PAS si l'utilisateur s'est déconnecté manuellement (401)
            if (reason !== DisconnectReason.loggedOut) {
                console.log("Tentative de reconnexion...");
                setTimeout(startMarco, 5000); // Délai de 5s avant de relancer
            }
        }
    });

    // ... (Reste de tes fonctions messages.upsert et group-participants)
}

app.listen(PORT, () => console.log(`Serveur prêt sur port ${PORT}`));
startMarco();
