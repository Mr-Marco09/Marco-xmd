////////server.js//////////

const express = require("express");
const config = require("./config.json");
const app = express();
const PORT = process.env.PORT || 10000;

const startServer = (marcoInstance) => {
    
    // Page d'accueil affichant les infos du bot
    app.get('/', (req, res) => {
        res.send(`
            <body style="font-family:sans-serif; text-align:center; padding-top:50px;">
                <img src="${config.botLogo}" width="150" style="border-radius:50%;">
                <h1>${config.botName} est actif</h1>
                <p>Propriétaire : ${config.ownerName} (${config.region})</p>
                <a href="${config.channelLink}">Rejoindre le canal</a>
            </body>
        `);
    });

    // Route pour obtenir le code de jumelage (Pairing Code)
    app.get('/pair', async (req, res) => {
        const num = req.query.code;
        if (!num) return res.status(400).json({ error: "Numéro requis (?code=509...)" });

        try {
            const code = await marcoInstance.requestPairingCode(num);
            res.status(200).json({ pairingCode: code });
        } catch (err) {
            res.status(500).json({ error: "Erreur lors de la génération du code" });
        }
    });

    app.listen(PORT, '0.0.0.0', () => {
        console.log(`🌍 Serveur Web de ${config.botName} lancé sur le port ${PORT}`);
    });
};

module.exports = { startServer };
