require("dotenv").config();

module.exports = {
  owner: process.env.OWNER_JID,
  botName: process.env.BOT_NAME || "MyBot",
  prefix: process.env.PREFIX || ".",
  mode: process.env.BOT_MODE || "public", // public | private
};
