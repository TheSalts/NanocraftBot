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
  ],
  partials: [Partials.Channel, Partials.Message, Partials.Reaction],
});

client.once("ready", () => {
  console.log("ChannelAdd Ready!");
});

client.login(token);

// 파일 상태 확인
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isButton()) return;
  if (interaction.customId !== "checkAPIstatus") return;
  let channel = client.channels.cache.get("1020706773549715607");
  await channel.send(`${__filename} 작동 중  |  ${new Date().toISOString()}`);
});

client.on("channelCreate", (channel) => {
  if (channel.guildId !== "987045537595420752") return;
  if (!channel.name.startsWith("ticket-")) return;
  const Embed = new Discord.EmbedBuilder()
    .setTitle("문의 안내")
    .setColor("Random")
    .setDescription("문의 내용에 맞는 버튼을 눌러주세요");
  const row = new Discord.ActionRowBuilder().addComponents(
    new Discord.ButtonBuilder()
      .setCustomId("upServer")
      .setLabel("서버 개선 문의")
      .setStyle(Discord.ButtonStyle.Primary),
    new Discord.ButtonBuilder()
      .setCustomId("qnaServer")
      .setLabel("서버 질문")
      .setStyle(Discord.ButtonStyle.Primary),
    new Discord.ButtonBuilder()
      .setCustomId("bugReport")
      .setLabel("버그 제보")
      .setStyle(Discord.ButtonStyle.Danger)
  );
  const row2 = new Discord.ActionRowBuilder().addComponents(
    new Discord.ButtonBuilder()
      .setCustomId("report")
      .setLabel("신고")
      .setStyle(Discord.ButtonStyle.Danger),
    new Discord.ButtonBuilder()
      .setCustomId("memberAdd")
      .setLabel("Nanocraft SMP 신청")
      .setStyle(Discord.ButtonStyle.Success),
    new Discord.ButtonBuilder()
      .setCustomId("other")
      .setLabel("기타")
      .setStyle(Discord.ButtonStyle.Secondary)
  );
  channel.send({ components: [row, row2], embeds: [Embed] });
});
