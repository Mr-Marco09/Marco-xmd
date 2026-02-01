///////// server.js corrigé /////////////

const express = require("express");
const path = require("path");
const app = express();

// Render utilise le port 10000 par défaut, ne force pas le 1000
const PORT = process.env.PORT || 10000; 

const startServer = (marco) => {
    app.get('/', (req, res) => res.sendFile(path.join(__dirname, '/index.html')));

    app.get('/pair', async (req, res) => {
        let num = req.query.number;
        if (!num) return res.status(400).json({ error: "Numéro manquant" });
        try {
            num = num.replace(/[^0-9]/g, '');
            const code = await marco.requestPairingCode(num);
            res.json({ code });
        } catch (err) {
            res.status(500).json({ error: "Erreur Pairing" });
        }
    });

    // Ajout de '0.0.0.0' pour s'assurer que le serveur accepte les connexions externes sur Render
    app.listen(PORT, '0.0.0.0', () => console.log(`🌍 Serveur sur port ${PORT}`));
};

module.exports = { startServer };
