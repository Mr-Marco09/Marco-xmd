/////////server.js/////////////

const express = require("express");
const path = require("path");
const app = express();
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

    app.listen(PORT, () => console.log(`🌍 Serveur sur port ${PORT}`));
};

module.exports = { startServer };
