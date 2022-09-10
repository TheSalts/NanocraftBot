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
  console.log("Reaction Ready!");
});

client.on("messageReactionRemove", async (reaction, user) => {
  let { guild } = reaction.message;
  let member = guild.members.cache.find((member) => member.id === user.id);
  let react = await reaction.fetch();
  switch (reaction.emoji.name) {
    case "📢":
      if (!react.message.author.bot) return;
      if (react.message.embeds[0].title !== "🔔알림 설정🔔") return;
      removeRole("🔔공지알림");
      break;
    case "📕":
      if (!react.message.author.bot) return;
      if (react.message.embeds[0].title !== "🔔알림 설정🔔") return;
      removeRole("🔔패치알림");
      break;
    case "🧪":
      if (!react.message.author.bot) return;
      if (react.message.embeds[0].title !== "🔔알림 설정🔔") return;
      removeRole("🔔나노크래프트 알림");
      break;
    default:
      break;
  }

  async function removeRole(rolename) {
    let rguild = client.guilds.cache.get(react.message.guildId);
    let role = rguild.roles.cache.find((role) => role.name === rolename);
    await member.roles.remove(role);
  }
});

client.on("messageReactionAdd", async (reaction, user) => {
  let { guild } = reaction.message;
  let member = guild.members.cache.find((member) => member.id === user.id);
  let react = await reaction.fetch();
  switch (reaction.emoji.name) {
    case "📢":
      if (!react.message.author.bot) return;
      if (react.message.embeds[0].title !== "🔔알림 설정🔔") return;
      addRole("🔔공지알림");
      break;
    case "📕":
      if (!react.message.author.bot) return;
      if (react.message.embeds[0].title !== "🔔알림 설정🔔") return;
      addRole("🔔패치알림");
      break;
    case "🧪":
      if (!react.message.author.bot) return;
      if (react.message.embeds[0].title !== "🔔알림 설정🔔") return;
      addRole("🔔나노크래프트 알림");
      break;
    case "translate":
      await googletranslate();
      break;
    default:
      break;
  }

  async function addRole(rolename) {
    let rguild = client.guilds.cache.get(react.message.guildId);
    let role = rguild.roles.cache.find((role) => role.name === rolename);
    await member.roles.add(role);
  }

  async function googletranslate() {
    const translate = require("@vitalets/google-translate-api");

    async function rolecheck() {
      if (!member.roles.cache.some((role) => role.name === "MOD")) {
        if (!reaction.message.channel.isThread()) {
          for (let channel of config.translateChannel)
            if (channel == reaction.message.channelId) return true;
        } else {
          for (let channel of config.translateChannel)
            if (channel == reaction.message.channel.parentId) return true;
        }
        return false;
      } else return true;
    }

    if (!(await rolecheck())) return;

    client.channels.cache
      .get(reaction.message.channelId)
      .messages.fetch(reaction.message.id)
      .then(async (msg) => {
        //번역
        async function translateLanguage(texts) {
          let response = await translate(texts, {
            to: "ko",
            autoCorrect: true,
          });
          if (response.from.language.iso == "ko")
            response = await translate(texts, {
              to: "en",
              autoCorrect: true,
            });
          return response.text;
        }

        const Textembed = new Discord.EmbedBuilder();
        if (msg.content) {
          var res = await translate(msg.content, {
            to: "ko",
            autoCorrect: true,
          });
          if (res.from.language.iso == "ko")
            res = await translate(msg.content, { to: "en", autoCorrect: true });

          Textembed.setAuthor({
            name: user.username,
            iconURL: user.displayAvatarURL(),
          })
            .setDescription("메시지를 번역했어요.")
            .setColor("Blue")
            .setTimestamp()
            .setFooter({
              text: "Google Translate",
              iconURL:
                "https://cdn.discordapp.com/emojis/970180449605390437.png?v=1",
            });
        }

        if (msg.embeds) {
          let array = [];
          array = await translateEmbed();
          if (msg.content) {
            array.push(Textembed);
            reaction.message.reply({
              embeds: array,
              content: `${res.text}`,
            });
          } else
            reaction.message.reply({
              embeds: array,
              content: `${res.text}`,
            });
          return;
        }

        async function translateEmbed() {
          let array = [];
          for (let embed of msg.embeds) {
            let Embed = new Discord.EmbedBuilder().setColor("Blue");
            if (embed.title)
              Embed.setTitle(await translateLanguage(embed.title));
            if (embed.description)
              Embed.setDescription(await translateLanguage(embed.description));
            if (embed.footer) {
              if (embed.footer.iconURL)
                Embed.setFooter({
                  text: await translateLanguage(embed.footer.text),
                  iconURL: embed.footer.iconURL,
                });
              else
                Embed.setFooter({
                  text: await translateLanguage(embed.footer.text),
                });
            }
            if (embed.fields) {
              for (let field of embed.fields) {
                Embed.addFields({
                  name: await translateLanguage(field.name),
                  value: await translateLanguage(field.value),
                });
              }
            }
            if (embed.author) {
              if (embed.author.iconURL) {
                if (embed.author.url)
                  Embed.setAuthor({
                    name: await translateLanguage(embed.author.name),
                    iconURL: embed.author.iconURL,
                    url: embed.author.url,
                  });
                else
                  Embed.setAuthor({
                    name: await translateLanguage(embed.author.name),
                    iconURL: embed.author.iconURL,
                  });
              }

              if (embed.author.url) {
                if (embed.author.iconURL)
                  Embed.setAuthor({
                    name: await translateLanguage(embed.author.name),
                    url: embed.author.url,
                    iconURL: embed.author.iconURL,
                  });
                else
                  Embed.setAuthor({
                    name: await translateLanguage(embed.author.name),
                    url: embed.author.url,
                  });
              }
            }
            if (embed.color) Embed.setColor(embed.color);
            if (embed.url) Embed.setURL(embed.url);
            if (embed.image) Embed.setImage(embed.image.url);
            if (embed.thumbnail) Embed.setThumbnail(embed.thumbnail.url);
            array.push(Embed);
          }
          return array;
        }

        await reaction.message.reply({
          embeds: [embed],
          content: `${res.text}`,
        });
      });
  }
});

client.login(token);
