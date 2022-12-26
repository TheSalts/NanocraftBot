const { token } = require("../config.json");
const Discord = require("discord.js");
const config = require("../config.json");

const { Client, GatewayIntentBits, Partials } = require("discord.js");
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildEmojisAndStickers,
  ],
  partials: [
    Partials.Channel,
    Partials.Message,
    Partials.Reaction,
    Partials.GuildMember,
  ],
});

client.once("ready", () => {
  console.log("Emoji Ready!");
});

client.login(token);

client.on("messageReactionAdd", (reaction, user) => {
  if (reaction.message.id !== "1043466482274807878") return;
  const guildMember = reaction.message.guild.members.cache.get(user.id);
  const role = reaction.message.guild.roles.cache.get("1039453536582369282");
  guildMember.roles.add(role);
});

client.on("messageReactionRemove", (reaction, user) => {
  if (reaction.message.id !== "1043466482274807878") return;
  const guildMember = reaction.message.guild.members.cache.get(user.id);
  const role = reaction.message.guild.roles.cache.get("1039453536582369282");
  guildMember.roles.remove(role);
});
