///////// server.js corrigé /////////////

const express = require("express");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 10000; 

let botInstance; // Variable pour stocker l'instance marco

app.get('/', (req, res) => res.sendFile(path.join(__dirname, '/index.html')));

app.get('/pair', async (req, res) => {
    let num = req.query.number;
    if (!num) return res.status(400).json({ error: "Numéro manquant" });
    if (!botInstance) return res.status(503).json({ error: "Bot non prêt" });
    
    try {
        num = num.replace(/[^0-9]/g, '');
        const code = await botInstance.requestPairingCode(num);
        res.json({ code });
    } catch (err) {
        res.status(500).json({ error: "Erreur Pairing" });
    }
});

// Le serveur écoute UNE SEULE FOIS ici
app.listen(PORT, '0.0.0.0', () => console.log(`🌍 Serveur Web actif sur port ${PORT}`));

// Cette fonction servira juste à mettre à jour l'instance du bot dans le serveur
const updateBotInstance = (marco) => {
    botInstance = marco;
};

module.exports = { updateBotInstance };
