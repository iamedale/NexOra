import config from "../../config.js"

export default {
  name: "menu",
  execute: async (sock, msg) => {
    const menuText = `
┏━🔥 ${config.botName.toUpperCase()} MENU 🔥━┓
┣ ${config.prefix[0]}menu
┣ ${config.prefix[0]}ping
┣ ${config.prefix[0]}time
┗━━━━━━━━━━━━━━
    `
    await sock.sendMessage(msg.key.remoteJid, { text: menuText })
  }
}
