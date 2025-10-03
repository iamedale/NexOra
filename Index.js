import makeWASocket, { useMultiFileAuthState, DisconnectReason } from "@whiskeysockets/baileys"
import { Boom } from "@hapi/boom"
import config from "./config.js"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 🔹 Load all commands dynamically
const commands = new Map()
const commandsPath = path.join(__dirname, "src/commands")

for (const file of fs.readdirSync(commandsPath)) {
  if (file.endsWith(".js")) {
    const command = (await import(`./src/commands/${file}`)).default
    commands.set(command.name, command)
  }
}

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("session")

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true,
    browser: ["NexOra", "Chrome", "1.0.0"],
  })

  sock.ev.on("creds.update", saveCreds)

  // 🔹 Message listener
  sock.ev.on("messages.upsert", async (m) => {
    const msg = m.messages[0]
    if (!msg.message || msg.key.fromMe) return

    const from = msg.key.remoteJid
    const text =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      ""

    // Check for prefix
    const prefixUsed = config.prefix.find((p) => text.startsWith(p))
    if (!prefixUsed) return

    const args = text.slice(prefixUsed.length).trim().split(/ +/)
    const commandName = args.shift().toLowerCase()

    const command = commands.get(commandName)
    if (command) {
      try {
        await command.execute(sock, msg, args)
      } catch (err) {
        console.error("❌ Command error:", err)
        await sock.sendMessage(from, { text: "⚠️ An error occurred while executing that command." })
      }
    }
  })

  // 🔹 Auto reconnect
  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update

    if (connection === "close") {
      const reason = new Boom(lastDisconnect?.error)?.output.statusCode
      console.log("Disconnected. Reason:", reason)

      if (reason !== DisconnectReason.loggedOut) {
        console.log("Reconnecting...")
        startBot() // retry
      } else {
        console.log("Device logged out. Delete session and re-pair.")
      }
    } else if (connection === "open") {
      console.log("✅ NexOra is online now!")
    }
  })
}

startBot()
