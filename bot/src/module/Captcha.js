const Discord = require("discord.js");
const config = require("../config.json");
const {
  Client,
  GatewayIntentBits,
  Partials,
  EmbedBuilder,
} = require("discord.js");
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
  partials: [Partials.Channel, Partials.Message, Partials.GuildMember],
});
const quick = require("../util/quick");
const util = require("../util/util");

client.once("ready", async () => {
  console.log("Captcha 실행 성공");
});
client.login(config.token);

var members = {};
function fetchmember(value) {
  members = value;
  return members;
}

var guildID = "";
function fetchguildId(value) {
  guildID = value;
  return guildID;
}

var roleID = "";
function fetchroleID(value) {
  roleID = value;
  return roleID;
}

var yesCaptcha = [];
function fetchCaptcha(value) {
  yesCaptcha.push(value);
  return yesCaptcha;
}
function deleteCaptcha(item) {
  let index = yesCaptcha.indexOf(item);
  if (index > -1) {
    yesCaptcha.splice(index, 1);
  }
  return yesCaptcha;
}

client.on("interactionCreate", (interaction) => {
  const lang = util.setLang(interaction.locale);
  if (!interaction.isButton()) return;
  if (interaction.customId === "whitelist") {
    if (
      !(
        interaction.member.roles.cache.some((role) => role.name === "MOD") ||
        interaction.member.roles.cache.some(
          (role) => role.name === "TRUSTED MEMBER"
        )
      )
    )
      return quick.sendPermissionErrorEmbed(interaction, "TRUSTED MEMBER");
    const firstEmbed = new Discord.EmbedBuilder()
      .setDescription(lang.captcha.embed.title)
      .setColor("#B266FF");
    interaction.user.send({ embeds: [firstEmbed] }).catch(() => {
      const errEmbed = new Discord.EmbedBuilder()
        .setTitle(lang.captcha.embed.error)
        .setDescription(lang.captcha.embed.dm)
        .setColor("#FF0000")
        .setImage("https://i.imgur.com/WQlZLmO.png");
      return interaction.reply({ embeds: [errEmbed], ephemeral: true });
    });

    fetchCaptcha(interaction.member.id);
    fetchmember(interaction.member);
    fetchguildId(interaction.guildId);
    fetchroleID(
      interaction.guild.roles.cache.find(
        (role) => role.name === "TRUSTED MEMBER"
      ).id
    );
  }
});

const { Captcha } = require("discord.js-captcha");

var captcha = new Captcha(client, {
  roleID: "987045537624784931", // TRUSTED MEMBER
  // channelID: "", //채널 고정 기능, 선택
  sendToTextChannel: false, //선택, 기본값: false
  kickOnFailure: false, //사용 X, 서버 가입 시 사용하는 기능 선택, 기본값: true.
  caseSensitive: false, //대소문자 구별  선택, 기본값: true.
  attempts: 3, //재시도 횟수  선택, 기본값: 1.
  timeout: 30000, //시간제한(ms)  선택, 기본값: 60000.
  showAttemptCount: true, //Embed Footer에 남은 횟수 표시 선택, 기본값: true.
  customPromptEmbed: new EmbedBuilder()
    .setDescription(
      "인증을 완료하려면 아래 이미지의 코드를 입력해주세요!\nTo complete auth, please solve captcha!"
    )
    .setColor("Blue")
    .setTitle("NANOCRAFT SMP - Creative Server | Captcha"),
  customSuccessEmbed: new EmbedBuilder()
    .setDescription(
      "인증에 성공했습니다.\n이제 NANOCRAFT 서버를 이용하실 수 있습니다.\n\nAuth success.\nYou can now enter NANOCRAFT SMP"
    )
    .setColor("Blue")
    .setTitle("Captcha"),
  customFailureEmbed: new EmbedBuilder()
    .setDescription("인증에 실패했습니다.\nAuth failed.")
    .setColor("Blue")
    .setTitle("Captcha"),
});

var nickname = "";
function name(value) {
  nickname = value;
  return nickname;
}

var prompt = [];
function prompting(value) {
  prompt.push(value);
  return prompt;
}

function deletePrompt(item) {
  let index = prompt.indexOf(item);
  if (index > -1) {
    prompt.splice(index, 1);
  }
  return prompt;
}

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (message.channel.type != Discord.ChannelType.DM) return;
  for (var i = 0; i < prompt.length; i++) {
    if (prompt[i] == message.author.id) return;
  }
  for (var i = 0; i < yesCaptcha.length; i++) {
    if (yesCaptcha[i] == message.author.id) await next();
  }

  async function next() {
    const secondEmbed = new Discord.EmbedBuilder()
      .setDescription(
        `닉네임이 \`${message.content}\`으로 설정되었습니다.\nNickname was set to \`${message.content}\``
      )
      .setColor("#B266FF");
    await message.author.send({ embeds: [secondEmbed] });
    name(message.content);
    prompting(message.author.id);
    captcha.options.guildID = guildID;
    await captcha.present(members);
  }
});

captcha.on("failure", async (data) => {
  let LogChannel = client.channels.cache.get(config.logChannel);
  const failEmbed = new Discord.EmbedBuilder()
    .setTitle("인증 실패")
    .setDescription(
      `**${nickname}** (${data.member.user.tag}) 님이 Captcha 인증에 실패했습니다.`
    )
    .setColor("#FF0000")
    .setTimestamp();
  LogChannel.send({ embeds: [failEmbed] });
  deletePrompt(data.member.user.id);
  deleteCaptcha(data.member.user.id);
});

captcha.on("timeout", async (data) => {
  let LogChannel = client.channels.cache.get(config.logChannel);
  const timeoutEmbed = new Discord.EmbedBuilder()
    // .setTitle("Whitelist Added")
    .setTitle("인증 실패 - 시간 초과")
    .setDescription(
      `**${nickname}** (${data.member.user.tag}) 님이 Captcha 인증에 실패했습니다.`
    )
    .setColor("#FF0000")
    .setTimestamp();
  LogChannel.send({ embeds: [timeoutEmbed] });
  deletePrompt(data.member.user.id);
  deleteCaptcha(data.member.user.id);
});

captcha.on("success", async (data) => {
  deletePrompt(data.member.user.id);
  deleteCaptcha(data.member.user.id);
  let LogChannel = client.channels.cache.get(config.logChannel);
  const LogEmbed = new Discord.EmbedBuilder()
    .setTitle("인증 성공")
    .setDescription(
      `**${nickname}** (${data.member.user.tag}) 님이 Captcha 인증에 성공했습니다.`
    )
    .setColor("#00FF80")
    .setTimestamp();

  const util = require("minecraft-server-util");
  let option1 = nickname;
  const ip = "182.231.209.148";

  const Rclient = new util.RCON(ip, {
    port: 8865,
    password: config.rconpw,
  });

  await Rclient.connect(ip, 8865)
    .then(async () => {
      await Rclient.login(config.rconpw);
      await Rclient.run(`whitelist add ${option1}`);
      await Rclient.run(`op ${option1}`);
      LogEmbed.addFields({ name: "RCON 실행", value: `성공` });
      await LogChannel.send({ embeds: [LogEmbed] });
    })
    .catch((error) => {
      const errorEmbed = new Discord.EmbedBuilder()
        .setTitle("Error")
        .setDescription(
          "코드를 실행하는 도중 예상치 못한 에러가 발생했습니다.\n" +
            error.stack
        )
        .setColor("#FF0000")
        .setTimestamp()
        .setFooter({ text: nickname + " | " + data.member.user.tag });
      LogChannel.send({ embeds: [errorEmbed] });
    });
});
