import makeWASocket, { useMultiFileAuthState, fetchLatestBaileysVersion } from "@whiskeysockets/baileys"
import fs from "fs"
import readline from "readline"
import config from "./config.js"

async function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })
  return new Promise(resolve => rl.question(query, ans => {
    rl.close()
    resolve(ans)
  }))
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

  // If no creds yet → ask for number & request pairing code
  if (!state.creds.registered) {
    const phoneNumber = await askQuestion("📱 Enter your WhatsApp number with country code (e.g. 2348123456789): ")
    const code = await sock.requestPairingCode(phoneNumber)
    console.log(`🔑 Pairing Code for ${phoneNumber}: ${code}`)
  }

  sock.ev.on("messages.upsert", async (m) => {
    const msg = m.messages[0]
    if (!msg.message || msg.key.fromMe) return

    const text = msg.message.conversation || ""
    const usedPrefix = config.prefix.find(p => text.startsWith(p))

    if (usedPrefix) {
      const command = text.slice(usedPrefix.length).trim().toLowerCase()

      switch (command) {
        case "ping":
          await sock.sendMessage(msg.key.remoteJid, { text: "Pong 🏓" })
          break
        case "owner":
          await sock.sendMessage(msg.key.remoteJid, { text: `Owner: ${config.owner}` })
          break
        case "hello":
          await sock.sendMessage(msg.key.remoteJid, { text: `Hello! I’m ${config.botName} 🤖` })
          break
        default:
          await sock.sendMessage(msg.key.remoteJid, { text: "Unknown command ❌" })
      }
    }
  })
}

startBot()
