const fs = require("fs");
const {
  Client,
  Collection,
  GatewayIntentBits,
  Partials,
} = require("discord.js");
const { token } = require("./config.json");

const Discord = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildBans,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildIntegrations,
  ],
  partials: [
    Partials.Channel,
    Partials.GuildMember,
    Partials.Reaction,
    Partials.Message,
    Partials.ThreadMember,
    Partials.User,
    Partials.GuildScheduledEvent,
  ],
});
const quick = require("./util/quick");

client.once("ready", () => {
  console.log("msg Ready!");
});

client.on("messageCreate", async (message) => {
  if (message.content === "!메시지") {
    let embed = new Discord.EmbedBuilder()
      .setDescription(
        "멤버들의 유튜브 알림을 받으시려면 아래 이모지를 눌러주세요!"
      )
      .setColor("#2F3136");
    let msg = await message.channel.send({ embeds: [embed] });
    msg.react("<:youtube:1043462943695720548>");
  }
});

client.login(token);
