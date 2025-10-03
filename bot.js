import makeWASocket, { useMultiFileAuthState, fetchLatestBaileysVersion } from "@whiskeysockets/baileys"
import fs from "fs"
import path from "path"
import config from "./config.js"

// Load all commands dynamically
const commands = new Map()
const commandsPath = path.resolve("./src/commands")

for (const file of fs.readdirSync(commandsPath)) {
  if (file.endsWith(".js")) {
    const command = (await import(`./src/commands/${file}`)).default
    commands.set(command.name, command)
  }
}

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("session")
  const { version } = await fetchLatestBaileysVersion()

  const sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: false,
    browser: [config.botName, "Chrome", "1.0.0"]
  })

  sock.ev.on("creds.update", saveCreds)

  // If it’s a fresh session, generate pairing code
  if (!state.creds.registered) {
    console.log("📱 Please enter your WhatsApp number with country code in config.js")
    const code = await sock.requestPairingCode(config.owner)
    console.log(`🔑 Pairing Code for ${config.owner}: ${code}`)
  }

  // Handle messages
  sock.ev.on("messages.upsert", async (m) => {
    const msg = m.messages[0]
    if (!msg.message || msg.key.fromMe) return

    const text = msg.message.conversation || ""
    const usedPrefix = config.prefix.find(p => text.startsWith(p))

    if (usedPrefix) {
      const commandName = text.slice(usedPrefix.length).trim().toLowerCase()
      const command = commands.get(commandName)

      if (command) {
        await command.execute(sock, msg)
      } else {
        await sock.sendMessage(msg.key.remoteJid, { text: "Unknown command ❌" })
      }
    }
  })
}

startBot()
