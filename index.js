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

client.commands = new Collection();
const commandFiles = fs
  .readdirSync("./commands")
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.data.name, command);
}
const contextCommandFiles = fs
  .readdirSync("./contextMenu")
  .filter((file) => file.endsWith(".js"));

for (const file of contextCommandFiles) {
  const command = require(`./contextMenu/${file}`);
  client.commands.set(command.data.name, command);
}
client.once("ready", () => {
  console.log("Command Ready!");
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  const logchannel = interaction.guild.channels.cache.find(
    (channel) => channel.name === "🔒│captcha-log"
  );
  const alertchn = interaction.guild.channels.cache.find(
    (channel) => channel.name === "⛔│제재"
  );
  let command = client.commands.get(interaction.commandName);

  if (!command) return;

  try {
    await command.execute(interaction, logchannel, alertchn);
  } catch (error) {
    console.error(error);
    quick.sendErrorEmbed(interaction, error);
  }
});

client.login(token);
