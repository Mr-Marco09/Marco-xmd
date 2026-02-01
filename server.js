///////// server.js corrigé /////////////
const express = require("express");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 10000;

let currentMarco = null;

const startServer = () => {
    app.get('/', (req, res) => res.sendFile(path.join(__dirname, '/index.html')));

    app.get('/pair', async (req, res) => {
        if (!currentMarco) return res.status(503).json({ error: "Bot non prêt" });
        // ... ta logique de pairing existante utilisant currentMarco
    });

    app.listen(PORT, '0.0.0.0', () => console.log(`🌍 Serveur sur port ${PORT}`));

    // Retourne un objet pour mettre à jour l'instance du bot
    return {
        updateMarco: (marco) => { currentMarco = marco; }
    };
};

module.exports = { startServer };
