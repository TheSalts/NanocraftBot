const { Client, GatewayIntentBits, Partials } = require("discord.js");
const { token } = require("./config.json");
const Discord = require("discord.js");
const client = new Client({
  intents: [
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildIntegrations,
    GatewayIntentBits.GuildWebhooks,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageTyping,
  ],
  partials: [
    Partials.Channel,
    Partials.Message,
    Partials.ThreadMember,
    Partials.User,
    Partials.GuildMember,
  ],
});
const wait = require("node:timers/promises").setTimeout;

client.login(token);

client.on("ready", async () => {
  let channel = client.channels.cache.get("1020706773549715607");
  const embed = new Discord.EmbedBuilder().setTitle("API status check");
  const row = new Discord.ActionRowBuilder().addComponents(
    new Discord.ButtonBuilder()
      .setCustomId("checkAPIstatus")
      .setLabel("API status")
      .setStyle(Discord.ButtonStyle.Success),
    new Discord.ButtonBuilder()
      .setCustomId("deleteAPIstatus")
      .setLabel("delete API status")
      .setStyle(Discord.ButtonStyle.Danger)
  );
  await channel.send({ components: [row], embeds: [embed] });
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isButton()) return;
  if (interaction.customId === "checkAPIstatus") {
    interaction.channel.send("checking API...");
    let list = [
      "/root/bot/event/Captcha.js",
      "/root/bot/event/interaction.js",
      "/root/bot/event/memberAdd.js",
      "/root/bot/event/channelAdd.js",
      "/root/bot/event/playerinfo-c.js",
      "/root/bot/event/notion.js",
      "/root/bot/index.js",
      "/root/bot/event/playerinfo-n.js",
      "/root/bot/event/msglog.js",
    ];
    let exist = [];
    await wait(1000 * 10).then(() => {
      interaction.channel.messages.fetch({ limit: 100 }).then((messages) => {
        messages.forEach((item) => {
          let value = list.find(item.content.split(" ")[0]);
          if (value[0]) exist.push(value[0]);
        });
      });
    });
  } else if (interaction.customId === "deleteAPIstatus") {
  } else return;
});
