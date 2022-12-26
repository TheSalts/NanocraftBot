const { token } = require("../config.json");
const Discord = require("discord.js");
const config = require("../config.json");
const fs = require("fs");

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

client.on("guildMemberAdd", (member) => {
  if (member.guild.id !== "987045537595420752") return;
  let channel = client.channels.cache.get("987045538249728000"); // Welcome 채널
  let maintopic = client.channels.cache.get("1004783888159227994"); // 메인토픽
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

  let msgid = "";
  let read = fs.readFileSync("../data/joinmsg.json", "utf8");
  let joinmsg = JSON.parse(read);
  maintopic
    .send({
      content: `<@${member.user.id}>\n\n나노크래프트 디스코드에 오신 것을 환영합니다.\n누구나 이용 가능한 야생 서버도 있으니 자유롭게 플레이 해보세요!\n자세한 내용은 <#1009483942799351868> 확인 바랍니다.\n\nWelcome to Nanocraft Discord.\nThere is also a public server that anyone can use, so feel free to play!\nFor more information, please check out <#1009483942799351868>`,
    })
    .then((message) => {
      message.react("👋");
      msgid = message.id;
      maintopic.messages.fetch(joinmsg.id).then((msg) => msg.delete());
      joinmsg = { id: msgid };
      fs.writeFileSync("../data/joinmsg.json", JSON.stringify(joinmsg));
    });
});
