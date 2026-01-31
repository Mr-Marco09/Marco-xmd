const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require("@whiskeysockets/baileys");
const express = require('express');
const path = require('path');
const pino = require('pino');
const app = express();

const PORT = process.env.PORT || 3000;
let privateMode = false;

async function startMarcoXmd() {
    const { state, saveCreds } = await useMultiFileAuthState('sessions');
    
    const bot = makeWASocket({
        logger: pino({ level: 'silent' }),
        auth: state,
        printQRInTerminal: true
    });

    // Serveur Web pour Render
    app.get('/', (req, res) => res.sendFile(path.join(__dirname, '/index.html')));
    app.listen(PORT, () => console.log(`Serveur Marco xmd sur port ${PORT}`));

    bot.ev.on('creds.update', saveCreds);

    bot.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'open') {
            console.log("MArco xmd : Connecté avec succès ! 🇭🇹");
            bot.sendMessage(bot.user.id, { text: "𝐌𝐚𝐫𝐜𝐨 𝐱𝐦𝐝 connecté !\nDev: 𝐌𝐫 𝐌𝐚𝐫𝐜𝐨" });
            // Rejoindre le canal (exemple)
            bot.groupAcceptInvite("ID_DU_CHANNEL");
        }
        if (connection === 'close') {
            let reason = lastDisconnect.error?.output?.statusCode;
            if (reason !== DisconnectReason.loggedOut) startMarcoXmd();
        }
    });

    // Gestion des messages et commandes
    bot.ev.on('messages.upsert', async m => {
        const msg = m.messages[0];
        if (!msg.message) return;
        const from = msg.key.remoteJid;
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text;

        // Mode Privé
        if (privateMode && !msg.key.fromMe) return;

        // Exemple commande simple
        if (text === '.ping') {
            await bot.sendMessage(from, { text: 'Pong! 🏓 Marco xmd est actif.' });
        }
    });

    // Welcome / Goodbye
    bot.ev.on('group-participants.update', async (anu) => {
        const metadata = await bot.groupMetadata(anu.id);
        if (anu.action == 'add') {
            bot.sendMessage(anu.id, { text: `Bienvenue chez les Marco's sur ${metadata.subject} !` });
        } else if (anu.action == 'remove') {
            bot.sendMessage(anu.id, { text: `Un membre a quitté le navire... Bye !` });
        }
    });
}

startMarcoXmd();
