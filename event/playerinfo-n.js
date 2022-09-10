const wait = require("node:timers/promises").setTimeout;
const Discord = require("discord.js");
const config = require("../config.json");
const { Client, GatewayIntentBits, Partials } = require("discord.js");
const client = new Client({
  intents: [GatewayIntentBits.Guilds],
  partials: [Partials.Channel],
});

client.login(config.token);

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

var count = 0;

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
      { name: "SMP 서버", value: survival, inline: true },
      {
        name: "크리에이티브 서버 유저",
        value: `\`${clist}\`` + ` | 봇 계정 ${cbotCount}개`,
        inline: true,
      },
      {
        name: "SMP 서버 유저",
        value: `\`${slist}\`` + ` | 봇 계정 ${sbotCount}개`,
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
      client.user.setActivity("크리서버: ⚠️서버 정보를 불러오지 못했습니다.");
      clistToString();
      cstat("서버 정보를 불러오지 못했습니다");
    } else {
      try {
        var body = JSON.parse(bodys);
        if (body.online == false) {
          client.user.setActivity("크리서버: ⚠️서버가 닫혀있습니다.");
          clistToString();
          cstat("서버가 닫혔습니다");
        } else {
          client.user.setActivity(
            `크리서버 동접 ${body.players.online}/${body.players.max}`
          );
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
  await rp(`https://api.mcsrvstat.us/2/${option2}`, (err, res, bodys) => {
    if (!bodys) {
      client.user.setActivity("야생서버: ⚠️서버 정보를 불러오지 못했습니다.");
      slistToString();
      sstat("서버 정보를 불러오지 못했습니다.");
    } else {
      var body = JSON.parse(bodys);
      if (body.online == false) {
        client.user.setActivity("야생서버: ⚠️서버가 닫혀있습니다.");
        slistToString();
        sstat("서버가 닫혔습니다");
      } else {
        client.user.setActivity(
          `야생서버 동접 ${body.players.online}/${body.players.max}`
        );
        if (body.players.list) slistToString(body.players.list);
        sstat(`${body.players.online}명 접속 중`);
      }
    }
  });

  statusEdit(cstat(), sstat(), messageId);
}

async function loop() {
  try {
    if (count == 4) count = 0;
    if (count == 0)
      await rp(`https://api.mcsrvstat.us/2/${option1}`, (err, res, bodys) => {
        if (!bodys) {
          client.user.setActivity(
            "크리서버: ⚠️서버 정보를 불러오지 못했습니다."
          );
          clistToString();

          statusEdit(
            cstat("서버 정보를 불러오지 못했습니다"),
            sstat(),
            messageId
          );
        } else {
          var body = JSON.parse(bodys);
          if (body.online == false) {
            client.user.setActivity("크리서버: ⚠️서버가 닫혀있습니다.");
            clistToString();

            statusEdit(cstat("서버가 닫혔습니다"), sstat(), messageId);
          } else {
            client.user.setActivity(
              `크리서버 동접 ${body.players.online}/${body.players.max}`
            );
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
    if (count == 1)
      await rp(`https://api.mcsrvstat.us/2/${option2}`, (err, res, bodys) => {
        if (!bodys) {
          client.user.setActivity(
            "야생서버: ⚠️서버 정보를 불러오지 못했습니다."
          );
          slistToString();
          statusEdit(
            cstat(),
            sstat("서버 정보를 불러오지 못했습니다"),
            messageId
          );
        } else {
          var body = JSON.parse(bodys);
          if (body.online == false) {
            client.user.setActivity("야생서버: ⚠️서버가 닫혀있습니다.");
            slistToString();
            statusEdit(cstat(), sstat("서버가 닫혔습니다"), messageId);
          } else {
            client.user.setActivity(
              `야생서버 동접 ${body.players.online}/${body.players.max}`
            );
            if (body.players.list) slistToString(body.players.list);
            else slistToString();
            statusEdit(
              cstat(),
              sstat(`${body.players.online}명 접속 중`),
              messageId
            );
          }
        }
      }).catch((err) => {
        console.error(err);
      });
    if (count == 2)
      client.user.setActivity("화이트리스트", { type: "LISTENING" });
    if (count == 3) {
      delete require.cache["../config.json"];
      client.user.setActivity(config.message, { type: "LISTENING" });
    }
    count++;
  } catch (err) {
    console.error(err);
  }
}

client.on("ready", async () => {
  var logchannel = client.channels.cache.get("987045539000496142");
  setchannel(logchannel);
  await logchannel
    .send({
      embeds: [new Discord.EmbedBuilder().setTitle("서버 상태를 불러오는 중")],
    })
    .then((msg) => {
      messageid(msg.id);
    });
  console.log("상태 메시지 변경이 시작되었습니다.");
  client.user.setActivity(config.message, { type: "LISTENING" });

  await getResponse();
  try {
    setInterval(loop, 15000);
  } catch (error) {
    console.error(error);
  }
});
