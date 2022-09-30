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
  ],
  partials: [
    Partials.Channel,
    Partials.Message,
    Partials.Reaction,
    Partials.GuildMember,
  ],
});

client.once("ready", () => {
  console.log("memberAdd Ready!");
});

client.login(token);

// 파일 상태 확인
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isButton()) return;
  if (interaction.customId !== "checkAPIstatus") return;
  let channel = client.channels.cache.get("1020706773549715607");
  await channel.send(`${__filename} 작동 중  |  ${new Date().toISOString()}`);
});

client.on("guildMemberAdd", (member) => {
  let channel = client.channels.cache.get("987045538249728000");
  function randomWelcomeDescription(nickname) {
    let array = [
      "{name} 님이 서버에 뛰어들어 오셨어요.",
      "{name} 님이 등장하셨어요!",
      "만나서 반가워요, {name} 님.",
      "{name} 님을 환영해요. 피자는 가져오셨겠죠?",
      "{name} 님이 서버에 막 등장하셨어요.",
      "{name} 님이 오셨어요.",
      "얼굴 보니 좋네요, {name} 님.",
    ];
    let rand = Math.floor(Math.random() * array.length);
    /**
     * @type {string}
     */
    let name = array[rand];
    return name.replace("{name}", nickname);
  }
  function randomWelcomeTitle() {
    let array = ["어서오세요!", "환영해요!", "안녕하세요!", "반가워요!"];
    let rand = Math.floor(Math.random() * array.length);

    return array[rand];
  }
  function formatDate(date) {
    return (
      date.getFullYear() +
      "년 " +
      (date.getMonth() + 1) +
      "월 " +
      date.getDate() +
      "일 " +
      date.getHours() +
      "시 " +
      date.getMinutes() +
      "분 " +
      date.getSeconds() +
      "초 " +
      "일월화수목금토".charAt(date.getUTCDay()) +
      "요일"
    );
  }
  const Embed = new Discord.EmbedBuilder()
    .setTitle(randomWelcomeTitle())
    .setDescription(randomWelcomeDescription(member.user.username))
    .setColor("Random")
    .addFields(
      { name: "아이디", value: member.user.id, inline: true },
      {
        name: "계정 생성일",
        value: formatDate(member.user.createdAt),
        inline: true,
      },
      { name: "서버 가입일", value: formatDate(member.joinedAt), inline: true }
    )
    .setThumbnail(member.displayAvatarURL());
  channel.send({ embeds: [Embed], content: `<@${member.user.id}>` });
});
