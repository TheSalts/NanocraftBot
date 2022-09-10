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

client.commands = new Collection();
const commandFiles = fs
  .readdirSync("./commands")
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.data.name, command);
}
client.once("ready", () => {
  console.log("Command Ready!");
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.type === Discord.InteractionType.ApplicationCommand) return;

  const logchannel = interaction.guild.channels.cache.find(
    (channel) => channel.name === "🔒│captcha-log"
  );
  const alertchn = interaction.guild.channels.cache.find(
    (channel) => channel.name === "⛔│제재"
  );
  const command = client.commands.get(interaction.commandName);

  if (!command) return;

  try {
    await command.execute(interaction, logchannel, alertchn);
  } catch (error) {
    console.error(error);
    const errors = new Discord.EmbedBuilder()
      .setTitle("Error")
      .setDescription(
        "에러가 발생했습니다.\n명령어가 잘못되었거나 코드에 문제가 발생했을 수 있습니다.\n" +
          error.stack
      )
      .setColor("#FF0000");
    return interaction.reply({
      embeds: [errors],
      ephemeral: true,
    });
  }
});

client.login(token);
