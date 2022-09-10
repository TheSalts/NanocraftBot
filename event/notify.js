const config = require("../config.json");
const { Client, GatewayIntentBits, Partials } = require("discord.js");
const client = new Client({
  intents: [GatewayIntentBits.Guilds],
  partials: [Partials.Channel],
});
const fs = require("fs");
const wait = require("node:timers/promises").setTimeout;

client.once("ready", () => {
  console.log("notify 실행 성공");
});

client.on("typingStart", async (data) => {
  if (!fs.existsSync("notify.json"))
    fs.writeFileSync("notify.json", JSON.stringify([]));
  // if (
  //   data.member.roles.cache.has("972760707722522625") ||
  //   data.member.roles.cache.has("972760770611937300") ||
  //   data.member.roles.cache.has("972761252298371124")
  // )
  //   return;
  let mode = "";
  // let archivechannels = [
  //   "907159497477324850",
  //   "968892742233104474",
  //   "921454435534770196",
  //   "907609240573714492",
  //   "907609200081928215",
  //   "907609376121061496",
  //   "907609415987888199",
  //   "908014038712205452",
  // ];
  let questionchannels = [
    "906584110171029525",
    "907169596140818483",
    "930742072548392991",
    "955462477150314496",
  ];
  let readnotify = fs.readFileSync("notify.json", "utf8");
  let notify = JSON.parse(readnotify);
  // for (let channelid of archivechannels) {
  //   if (channelid == data.channel.id) mode = "archive";
  // }
  for (let channelid of questionchannels) {
    if (channelid == data.channel.id) mode = "question";
  }
  let checkchannel = false;
  for (let notifys of notify) {
    if (notifys.mode == mode) {
      for (let channel of questionchannels)
        if (channel == data.channel.id) {
          checkchannel = true;
          break;
        }
      for (let id of notifys.user)
        if (id == data.user.id) {
          checkchannel = false;
          break;
        }
    }
  }
  if (checkchannel == false) return;

  let thread = "";
  thread = await data.channel.threads.create({
    name: data.user.tag,
    autoArchiveDuration: 60,
    type: "GUILD_PRIVATE_THREAD",
  });
  await thread.members.add(data.user.id);
  if (mode == "question") {
    await thread.send(
      `안녕하세요 **${data.user.username}**님!\n\n혹시 <#906583981271687188>을 처음 이용하시나요?\n그렇다면 <#906584040482676786>에서 질문 양식을 먼저 보시는걸 추천드려요.\n질문 양식에 따라 질문하셔서 보다 정확한 답변을 받고 커뮤니티 질서를 유지해주세요.\n\n*(이 메시지는 최초 1회만 발신되며, 5분 뒤 자동으로 삭제됩니다.)*`
    );
  }
  for (let notifys of notify) {
    if (notifys.mode == mode) {
      notifys.user.push(data.user.id);
      break;
    }
  }
  fs.writeFileSync("notify.json", JSON.stringify(notify));
  await wait(1000 * 60 * 5).then(() => {
    thread.delete();
  });
});

client.login(config.token);
