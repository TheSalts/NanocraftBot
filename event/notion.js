const { token } = require("../config.json");
const Discord = require("discord.js");
const config = require("../config.json");
const quick = require("../util/quick");
const util = require("../util/util");

const { GatewayIntentBits, Partials } = require("discord.js");
const client = new Discord.Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
  ],
  partials: [Partials.Channel, Partials.Message, Partials.Reaction],
});
const fs = require("fs");

const { Client } = require("@notionhq/client");
const path = require("path");

const notion = new Client({ auth: config.notionApiKey });

const startAt = new Date();
startAt.toISOString();

client.once("ready", async () => {
  console.log("Notion SDK Ready!");
  async function sendMessage() {
    /**
     * @type {Discord.ForumChannel}
     */
    let channel = client.channels.cache.get("1022476510839459880");
    let sendData = await getData();
    if (!sendData) return console.log("no page detected, return");
    else console.log("new page detected, sending message");
    let thread = await channel.threads.create({
      name: sendData[0].Title,
      message: { embeds: [sendData[1]] },
      appliedTags: [sendData[0].Tag],
    });
    for (let msg of sendData[2]) {
      if (msg) await thread.send(msg);
    }
  }
  setInterval(sendMessage, 15 * 1000);
});

client.login(token);

// 파일 상태 확인
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isButton()) return;
  if (interaction.customId !== "checkAPIstatus") return;
  let channel = client.channels.cache.get("1020706773549715607");
  await channel.send(`${__filename} 작동 중  |  ${new Date().toISOString()}`);
});

/**
 * @description notion api에서 데이터를 불러옵니다
 * @returns {[ { Title, Author, Fields, URL, Tag }, Embed, [String]]}
 */
async function getData() {
  console.log("cheking database...");
  let time = new Date();
  const databaseId = "d6b58a25dfb3459a9be3f8f7fc4ce8f1";
  const response = await notion.databases.query({
    database_id: databaseId,
    filter: {
      timestamp: "created_time",
      created_time: { on_or_after: startAt },
    },
  });
  for (let data of response.results) {
    let notionData = util.readFile(path.resolve("../data/notionData.json"));

    if (notionData.find((element) => element === data.id)) break;

    let CreatedTime = new Date(data.created_time);
    let difference = time.getTime() - CreatedTime.getTime();

    if (difference > 180000) {
      console.log(`${data.properties.이름} was uploaded`);

      notionData.push(data.id);
      fs.writeFileSync("../data/notionData.json", JSON.stringify(notionData));

      let title = data.properties.이름.title[0]?.plain_text ?? "비어 있음";
      let Author = {
        name: data.properties["작업 책임자"].people[0]?.name ?? "비어 있음",
      };
      if (data.properties["작업 책임자"].people[0]?.avatar_url)
        Author.iconURL = data.properties["작업 책임자"].people[0]?.avatar_url;
      let fields = [
        {
          name: "문서 종류",
          value: data.properties["문서 종류"].select?.name ?? "비어 있음",
          inline: true,
        },
        {
          name: "우선순위",
          value: data.properties["우선순위"].select?.name ?? "비어 있음",
          inline: true,
        },
        {
          name: "유형",
          value: data.properties["유형"].select?.name ?? "비어 있음",
          inline: true,
        },
      ];
      const Embed = new Discord.EmbedBuilder()
        .setTitle(title)
        .setAuthor(Author)
        .setFields(fields[0], fields[1], fields[2])
        .setURL(data.url)
        .setColor("#36393F")
        .setFooter({
          text: "Notion",
          iconURL:
            "https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png",
        })
        .setTimestamp(new Date(data.created_time).getTime());
      let tag;
      switch (data.properties["작업 상태"].select?.name) {
        case "진행 전":
          tag = "1022479350152572978";
          // {
          //   id: '1022479350152572978',
          //   name: '진행전 🔴',
          //   moderated: false,
          //   emoji: null
          // },
          break;
        case "작업 완료":
          tag = "1022479381916041226";
          // {
          //   id: '1022479381916041226',
          //   name: '작업 완료 ✅',
          //   moderated: false,
          //   emoji: null
          // },
          break;
        case "진행 중":
          tag = "1022479410126925824";
          // {
          //   id: '1022479410126925824',
          //   name: '진행중 🔧',
          //   moderated: false,
          //   emoji: null
          // }
          break;
        case "To Do":
          tag = "1022479350152572978";
          // {
          //   id: '1022479350152572978',
          //   name: '진행전 🔴',
          //   moderated: false,
          //   emoji: null
          // },
          break;
      }
      let pageData = await getPageDataToMsg(data.id);
      return [
        {
          Title: title,
          Author: Author,
          Fields: fields,
          URL: data.url,
          Tag: tag,
        },
        Embed,
        pageData,
      ];
    } else return null;
  }
}

/**
 * @param {string} id
 * @returns {Array}
 */
async function getPageDataToMsg(id) {
  const response = await notion.blocks.children.list({ block_id: id });
  let array = [];
  let message = "";
  for (let data of response.results) {
    let dataArray = Object.keys(data);
    let lastDataName = dataArray[dataArray.length - 1];
    let lastData = data[`${lastDataName}`];
    if (lastData.rich_text)
      message = message + lastData.rich_text[0].text.content + "\n";
    else if (lastData.title) message + lastData.title + "\n";
    else if (lastData.url) {
      array.push(message);
      message = "";
      message = message + lastData.url + "\n";
    } else if (lastData.external) {
      array.push(message);
      message = "";
      message = message + lastData.external.url + "\n";
    } else if (lastData.expression)
      message = message + `\`${lastData.expression}\`` + "\n";
  }
  array.push(message);
  return array;
}
