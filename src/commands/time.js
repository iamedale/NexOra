export default {
  name: "time",
  execute: async (sock, msg) => {
    const now = new Date()
    const timeString = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    await sock.sendMessage(msg.key.remoteJid, { text: `⏰ Current time: ${timeString}` })
  }
}
