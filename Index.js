const {
  default: makeWASocket,
  useMultiFileAuthState,
  makeCacheableSignalKeyStore,
  DisconnectReason
} = require("@whiskeysockets/baileys");
const pino = require("pino");
const fs = require("fs");
const { owner, botName, prefix, mode } = require("./config");

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("./session");

  const sock = makeWASocket({
    logger: pino({ level: "silent" }),
    printQRInTerminal: true,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" })),
    },
    browser: [botName, "Chrome", "1.0.0"],
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", ({ connection }) => {
    if (connection === "open") {
      console.log(`✅ ${botName} connected successfully!`);
    }
  });

  // 🛑 Helper
  const isOwner = (jid) => jid === owner;

  // 📌 Message Handler
  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const from = msg.key.remoteJid;
    const sender = msg.key.participant || msg.key.remoteJid;
    const text =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text || "";

    // Private Mode Restriction
    if (mode === "private" && !isOwner(sender)) return;

    // Commands
    if (text === prefix + "ping") {
      await sock.sendMessage(from, { text: "🏓 Pong!" });
    }

    if (text === prefix + "owner") {
      await sock.sendMessage(from, { text: `👑 Owner: ${owner}` });
    }

    if (text === prefix + "whoami") {
      await sock.sendMessage(from, { text: `🆔 Your JID: ${sender}` });
    }

    if (text === prefix + "help") {
      await sock.sendMessage(from, {
        text: `
🤖 *${botName} Help*
${prefix}ping - check bot speed
${prefix}owner - show owner
${prefix}whoami - show your JID
${prefix}help - show this message
        `
      });
    }
  });
}

startBot();
