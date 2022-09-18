const { token } = require("../config.json");
const Discord = require("discord.js");
const config = require("../config.json");
const { Client, GatewayIntentBits, Partials } = require("discord.js");
const fs = require("fs");
const quick = require("../util/quick");
const util = require("../util/util");
const { channel } = require("diagnostics_channel");
const wait = require("node:timers/promises").setTimeout;
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessages,
  ],
  partials: [Partials.Channel],
});

client.once("ready", () => {
  console.log("Message Ready!");
});

// 파일 상태 확인
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isButton()) return;
  if (interaction.customId !== "checkAPIstatus") return;
  let channel = client.channels.cache.get("1020706773549715607");
  await channel.send(`${__filename} 작동 중  |  ${new Date().toISOString()}`);
});

client.on("messageCreate", async (message) => {
  for (let channel of util.readFile("../data/publicChannel.json")) {
    if (message.channelId === channel.public.id) {
      await sendMessage(
        message.guild.channels.cache.get(channel.nanocraft.id),
        "Blue",
        true
      );
      break;
    } else if (message.channelId === channel.nanocraft.id) {
      await sendMessage(
        message.guild.channels.cache.get(channel.public.id),
        "Blue",
        true
      );
      break;
    }
  }
  if (message.channel.name === "✅│야생-서버") {
    if (
      !message.author.bot &&
      !message.member.roles.cache.some((role) => role.name === "MOD") &&
      !message.member.roles.cache.some((role) => role.name === "STAFF")
    ) {
      if (!message.content?.startsWith("!!"))
        return await message
          .reply(
            `안녕하세요 <@${message.author.id}>님!\n<#${message.channelId}>에서는 \`!!resgister\` 명령어만 사용할 수 있어요.\n\n__이 메시지는 5초 뒤에 자동으로 삭제돼요.__`
          )
          .then((msg) => {
            message.delete();
            wait(5 * 1000).then(() => {
              msg.delete();
            });
          });
    }
  }
  if (message.guild !== client.guilds.cache.get("987045537595420752")) return;
  if (message.author.bot) return;
  let logchannel = message.guild.channels.cache.find(
    (channel) => channel.name === "📃│메시지-로그"
  );

  function urlcheck(text) {
    let textOld = text;
    let urlRegex = /(https?:\/\/[^\s]+)/g;
    let urlResult = text.replace(urlRegex, function () {
      return "";
    });
    if (textOld === urlResult) return true;
    else return false;
  }

  for (let channel of ["1004784085748695051", "1004784122666958848"]) {
    if (!message.content) break;
    if (message.attachments.size > 0) break;
    if (channel === message.channelId)
      if (urlcheck(message.content) === true)
        return await message
          .reply(
            `안녕하세요 <@${message.author.id}>님!\n<#1004784085748695051>, <#1004784122666958848>에서는 일반 메시지를 작성할 수 없어요.\n링크 또는 첨부파일을 업로드해주세요.\n\n__이 메시지는 10초 뒤에 자동으로 삭제돼요.__`
          )
          .then((msg) => {
            message.delete();
            wait(10 * 1000).then(() => {
              msg.delete();
            });
          });
  }

  await sendMessage(logchannel);
  /**
   * @param {Discord.TextChannel} channel
   * @param {string} color ColorResolvable: https://discord.js.org/#/docs/discord.js/main/typedef/ColorResolvable
   * @param {boolean} nobot
   */
  async function sendMessage(channel, color, nobot) {
    if (nobot === true && message.author.bot) return false;

    if (!color) color = "#66FF66";
    const Embed = new Discord.EmbedBuilder()
      .setTitle("메시지 로그")
      .setAuthor({
        name: message.author.tag,
        iconURL: message.author.displayAvatarURL(),
      })
      .setTimestamp(message.createdTimestamp)
      .setColor(color)
      .setFooter({ text: message.channel.name })
      .setURL(message.url);
    let fileArray = [];
    if (message.content)
      Embed.addFields({ name: "메시지", value: message.cleanContent });
    else Embed.setDescription("[content]");
    if (message.attachments) {
      for (const attachment of message.attachments)
        fileArray.push(attachment[1].url);
    }
    if (fileArray[0]) await channel.send({ embeds: [Embed], files: fileArray });
    else await channel.send({ embeds: [Embed] });
  }
});

client.on("messageUpdate", async (old, message) => {
  if (message.guild !== client.guilds.cache.get("987045537595420752")) return;
  if (message.author.bot) return;

  let logchannel = message.guild.channels.cache.find(
    (channel) => channel.name === "📃│메시지-로그"
  );

  const Embed = new Discord.EmbedBuilder()
    .setTitle("메시지 수정")
    .setAuthor({
      name: message.author.tag,
      iconURL: message.author.displayAvatarURL(),
    })
    .setTimestamp(message.createdTimestamp)
    .setColor("#FF9933")
    .setFooter({ text: message.channel.name })
    .setURL(message.url);
  let fileArray = [];
  let fileArrayold = [];
  if (old.content)
    Embed.addFields({ name: "수정 전 메시지", value: old.cleanContent });
  if (message.content)
    Embed.addFields({ name: "수정 후 메시지", value: message.cleanContent });
  else Embed.setDescription("[content]");
  if (message.attachments) {
    for (const attachment of message.attachments) {
      fileArray.push(attachment[1].url);
    }
  }
  if (old.attachments) {
    for (const attachment of old.attachments) {
      fileArrayold.push(attachment[1].url);
    }
  }
  if (fileArrayold[0]) {
    await logchannel.send({ files: fileArray });
    await logchannel.send("↑ 수정 전 파일 ↑");

    if (fileArray[0]) await logchannel.send({ files: fileArray });
    await logchannel.send("↑ 수정 후 파일 ↑");
    await logchannel.send({ embeds: [Embed] });
    return;
  }
  if (fileArray[0])
    await logchannel.send({ embeds: [Embed], files: fileArray });
  else await logchannel.send({ embeds: [Embed] });
});

client.on("messageDelete", async (message) => {
  if (message.guild !== client.guilds.cache.get("987045537595420752")) return;
  if (message.author.bot) return;
  let logchannel = message.guild.channels.cache.find(
    (channel) => channel.name === "📃│메시지-로그"
  );

  const Embed = new Discord.EmbedBuilder()
    .setTitle("메시지 삭제")
    .setAuthor({
      name: message.author.tag,
      iconURL: message.author.displayAvatarURL(),
    })
    .setTimestamp()
    .setColor("#FF0000")
    .setFooter({ text: message.channel.name });
  let fileArray = [];
  if (message.content)
    Embed.addFields({ name: "메시지", value: message.cleanContent });
  else Embed.setDescription("[content]");
  if (message.attachments) {
    for (const attachment of message.attachments) {
      fileArray.push(attachment[1].url);
    }
  }
  if (fileArray[0])
    await logchannel.send({ embeds: [Embed], files: fileArray });
  else await logchannel.send({ embeds: [Embed] });
});

client.login(token);
