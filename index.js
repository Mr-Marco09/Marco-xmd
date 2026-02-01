/////////new index.js///////////

const { 
    default: makeWASocket, useMultiFileAuthState, DisconnectReason, 
    fetchLatestWaWebVersion, Browsers, makeCacheableSignalKeyStore 
} = require("@whiskeysockets/baileys");
const pino = require("pino");
const fs = require("fs");
const path = require("path");
const config = require("./config.json");
const { startServer } = require("./server");
const { handleEvents } = require("./events");

// --- CHARGEMENT DES PLUGINS ---
const commands = new Map();
const loadPlugins = () => {
    const pluginPath = path.join(__dirname, "plugins");
    if (!fs.existsSync(pluginPath)) fs.mkdirSync(pluginPath);

    fs.readdirSync(pluginPath).forEach((file) => {
        if (file.endsWith(".js")) {
            const plugin = require(`./plugins/${file}`);
            if (plugin.name) {
                commands.set(plugin.name, plugin);
            }
        }
    });
    console.log(`📦 ${commands.size} Plugins chargés avec succès`);
};

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('session');
    const { version } = await fetchLatestWaWebVersion().catch(() => ({ version: [2, 3000, 1015901307] }));

    const marco = makeWASocket({
        version,
        logger: pino({ level: "fatal" }),
        printQRInTerminal: false,
        browser: Browsers.ubuntu("Chrome"),
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" })),
        }
    });

    // On charge les plugins au démarrage
    loadPlugins();

    // On relie le serveur (Pairing)
    startServer(marco);

    // On relie les événements (Welcome, Status, Command Handler)
    // On passe 'commands' en argument pour que events.js puisse les utiliser
    handleEvents(marco, saveCreds, commands);

    marco.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'open') console.log("✅ DARK_MD Connecté et prêt !");
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) startBot();
        }
    });
}

startBot().catch(err => console.error("Erreur critique:", err));
