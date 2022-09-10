const { token } = require("../config.json");
const Discord = require("discord.js");
const config = require("../config.json");

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

const notion = new Client({ auth: config.notionApiKey });

const startAt = new Date();
startAt.toISOString();
console.log(startAt.getTime());

client.once("ready", async () => {
  console.log("Notion SDK Ready!");
  async function sendMessage() {
    let channel = client.channels.cache.get("987045539000496144");
    let sendEmbed = await getData();
    if (!sendEmbed) return;
    await channel.send({ embeds: [sendEmbed] });
  }
  setInterval(sendMessage, 10 * 1000);
});

client.login(token);

/**
 * @description notion api에서 데이터를 불러옵니다
 * @returns {Discord.Embed} Discord Embed
 */
async function getData() {
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
    if (!fs.existsSync("../data/notionData.json"))
      fs.writeFileSync("../data/notionData.json", JSON.stringify([]));
    let readfile = fs.readFileSync("../data/notionData.json", "utf8");
    let notionData = JSON.parse(readfile);

    if (notionData.find((element) => element === data.id)) break;

    let CreatedTime = new Date(data.created_time);
    let difference = time.getTime() - CreatedTime.getTime();

    if (difference > 180000) {
      console.log(`${data.properties.이름} was uploaded`);

      notionData.push(data.id);
      fs.writeFileSync("../data/notionData.json", JSON.stringify(notionData));

      let title = data.properties.이름.title[0]?.plain_text;
      let Author = {
        name: data.properties["작업 책임자"].people[0]?.name,
        iconURL: data.properties["작업 책임자"].people[0]?.avatar_url,
      };
      let fields = [
        {
          name: "작업 상태",
          value: data.properties["작업 상태"].select?.name,
          inline: true,
        },
        {
          name: "문서 종류",
          value: data.properties["문서 종류"].select?.name,
          inline: true,
        },
        {
          name: "우선순위",
          value: data.properties["우선순위"].select?.name,
          inline: true,
        },
        {
          name: "유형",
          value: data.properties["유형"].select?.name,
          inline: true,
        },
      ];
      if (!title) title = "비어 있음";
      if (!Author.name) Author.name = "비어 있음";
      if (!Author.iconURL) Author.iconURL = "비어 있음";
      fields.forEach((field) => {
        if (!field.value) field.value = "비어 있음";
      });
      const Embed = new Discord.EmbedBuilder()
        .setTitle(title)
        .setAuthor(Author)
        .setFields(fields[0], fields[1], fields[2], fields[3])
        .setURL(data.url)
        .setColor("Random")
        .setFooter({
          text: "Notion",
          iconURL:
            "https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png",
        })
        .setTimestamp(new Date(data.created_time).getTime());
      return Embed;
    }
  }
}
