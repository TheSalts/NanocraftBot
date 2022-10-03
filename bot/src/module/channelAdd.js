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
  const Embeden = new Discord.EmbedBuilder()
    .setTitle("Ticket")
    .setColor("Random")
    .setDescription("Press the button below");
  const rowen = new Discord.ActionRowBuilder().addComponents(
    new Discord.ButtonBuilder()
      .setCustomId("upServer")
      .setLabel("New feature")
      .setStyle(Discord.ButtonStyle.Primary),
    new Discord.ButtonBuilder()
      .setCustomId("qnaServer")
      .setLabel("Question")
      .setStyle(Discord.ButtonStyle.Primary),
    new Discord.ButtonBuilder()
      .setCustomId("bugReport")
      .setLabel("Report bug")
      .setStyle(Discord.ButtonStyle.Danger)
  );
  const row2en = new Discord.ActionRowBuilder().addComponents(
    new Discord.ButtonBuilder()
      .setCustomId("report")
      .setLabel("Report user")
      .setStyle(Discord.ButtonStyle.Danger),
    new Discord.ButtonBuilder()
      .setCustomId("memberAdd")
      .setLabel("Sing up Nanocraft SMP")
      .setStyle(Discord.ButtonStyle.Success),
    new Discord.ButtonBuilder()
      .setCustomId("other")
      .setLabel("Etc")
      .setStyle(Discord.ButtonStyle.Secondary)
  );
  channel.send({ components: [row, row2], embeds: [Embed] });
  channel.send({ components: [rowen, row2en], embeds: [Embeden] });
});

// client.on("threadCreate", (thread, newly) => {
//   const notionChannelId = "1022476510839459880";
//   console.info(newly);
//   if (thread.parentId !== notionChannelId) return;
//   const Embed = new Discord.EmbedBuilder()
//     .setTitle("노션 동기화")
//     .setDescription(
//       `<#${thread.parentId}>에서는 노션 페이지와 연동해야 스레드를 사용할 수 있어요.\n아래 버튼을 눌러 동기화를 진행해주세요.`
//     )
//     .setColor("#36393F");
//   const row = new Discord.ActionRowBuilder().addComponents(
//     new Discord.ButtonBuilder()
//       .setCustomId("notionSync")
//       .setLabel("동기화")
//       .setStyle(Discord.ButtonStyle.Success)
//   );
//   thread.send({ embeds: [Embed], components: [row] });
// });
