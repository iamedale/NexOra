import config from "../../config.js"

export default {
  name: "menu",
  execute: async (sock, msg) => {
    const prefix = config.prefix[0] // use first prefix (example: !, ., #)

    const menuText = `
┏━🔥 *GENERAL* 🔥━┓
┣ ${prefix}menu
┣ ${prefix}help
┣ ${prefix}about
┣ ${prefix}ping
┣ ${prefix}time
┣ ${prefix}owner
┣ ${prefix}rules
┣ ${prefix}whoami
┣ ${prefix}fact
┣ ${prefix}joke
┣ ${prefix}quote
┣ ${prefix}weather
┣ ${prefix}news
┣ ${prefix}wiki
┣ ${prefix}crypto
┗━━━━━━━━━━━━━━
    `.trim()

    await sock.sendMessage(msg.key.remoteJid, { text: menuText })
  }
                                               }
