const wait = require("node:timers/promises").setTimeout;
const Discord = require("discord.js");
const config = require("../config.json");
const { Client, GatewayIntentBits, Partials } = require("discord.js");
const client = new Client({
  intents: [GatewayIntentBits.Guilds],
  partials: [Partials.Channel],
});

client.login(config.token);

// 파일 상태 확인
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isButton()) return;
  if (interaction.customId !== "checkAPIstatus") return;
  let channel = client.channels.cache.get("1020706773549715607");
  await channel.send(`${__filename} 작동 중  |  ${new Date().toISOString()}`);
});

const rp = require("request-promise");
const option1 = "creative.nanocraft.kr";
const option2 = "smp.nanocraft.kr";

var messageId = null;
function messageid(id) {
  messageId = id;
  return messageId;
}

var Cstat = "";
var Sstat = "";

function cstat(v) {
  if (!v) return Cstat;
  Cstat = v;
  return Cstat;
}
function sstat(v) {
  if (!v) return Sstat;
  Sstat = v;
  return Sstat;
}

var clist = "없음";
var slist = "없음";
var cbotCount = 0;
var sbotCount = 0;

function clistToString(list1) {
  let botCount = 0;
  if (list1) {
    if (Array.isArray(list1)) {
      clist = "";
      for (let i = 0; i < list1.length; i++) {
        if (list1[i].substring(0, 4).toLowerCase() == "bot_") botCount++;
        if (list1.length - 1 == i) {
          clist = clist + list1[i];
          break;
        }
        clist = clist + list1[i] + ", ";
      }
      cbotCount = botCount;
    }
  } else clist = "없음";
  return clist;
}

function slistToString(list2) {
  let botCount = 0;
  if (list2) {
    if (Array.isArray(list2)) {
      slist = "";
      for (let i = 0; i < list2.length; i++) {
        if (list2[i].substring(0, 4).toLowerCase() == "bot_") botCount++;
        if (list2.length - 1 == i) {
          slist = slist + list2[i];
          break;
        }
        slist = slist + list2[i] + ", ";
      }
      sbotCount = botCount;
    }
  } else slist = "없음";
  return slist;
}

var channel = "";
function setchannel(value) {
  channel = value;
  return channel;
}

async function statusEdit(creative, survival, msgid) {
  let embed = new Discord.EmbedBuilder()
    .setColor("#9933FF")
    .setTimestamp()
    .setTitle("NANOCRAFT 서버 상태")
    .addFields(
      { name: "크리에이티브 서버", value: creative, inline: true },
      {
        name: "크리에이티브 서버 유저",
        value: `\`${clist}\`` + ` | 봇 계정 ${cbotCount}개`,
        inline: true,
      }
    );

  await channel.messages.fetch(msgid).then((msg) => {
    msg.edit({ embeds: [embed] });
  });
}

async function getResponse() {
  await rp(`https://api.mcsrvstat.us/2/${option1}`, (err, res, bodys) => {
    if (!bodys) {
      clistToString();
      cstat("서버 정보를 불러오지 못했습니다");
    } else {
      try {
        var body = JSON.parse(bodys);
        if (body.online == false) {
          clistToString();
          cstat("서버가 닫혔습니다");
        } else {
          if (body.players.list) clistToString(body.players.list);
          cstat(`${body.players.online}명 접속 중`);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }).catch((err) => {
    console.error(err);
  });

  statusEdit(cstat(), sstat(), messageId);
}

async function loop() {
  try {
    await rp(`https://api.mcsrvstat.us/2/${option1}`, (err, res, bodys) => {
      if (!bodys) {
        clistToString();

        statusEdit(
          cstat("서버 정보를 불러오지 못했습니다"),
          sstat(),
          messageId
        );
      } else {
        var body = JSON.parse(bodys);
        if (body.online == false) {
          clistToString();

          statusEdit(cstat("서버가 닫혔습니다"), sstat(), messageId);
        } else {
          if (body.players.list) clistToString(body.players.list);
          else clistToString();
          statusEdit(
            cstat(`${body.players.online}명 접속 중`),
            sstat(),
            messageId
          );
        }
      }
    }).catch((err) => {
      console.error(err);
    });
  } catch (err) {
    console.error(err);
  }
}

client.on("ready", async () => {
  var logchannel = client.channels.cache.get("1004876834099429397");
  setchannel(logchannel);
  await logchannel.messages.fetch().then((messages) => {
    messages.forEach((msg) =>
      msg.embeds?.forEach((embed) => {
        if (embed.title === "NANOCRAFT 서버 상태") msg.delete();
      })
    );
  });
  await logchannel
    .send({
      embeds: [new Discord.EmbedBuilder().setTitle("서버 상태를 불러오는 중")],
    })
    .then((msg) => {
      messageid(msg.id);
    });
  console.log("상태 메시지 변경이 시작되었습니다.");

  await getResponse();
  try {
    setInterval(loop, 15000);
  } catch (error) {
    console.error(error);
  }
});
