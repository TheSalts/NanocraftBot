const { ContextMenuCommandBuilder } = require("@discordjs/builders");
const { ApplicationCommandType } = require("discord.js");
const Discord = require("discord.js");
const quick = require("../util/quick.js");

module.exports = {
  data: new ContextMenuCommandBuilder()
    .setName("translate")
    .setType(ApplicationCommandType.Message),
  /**
   * @param {Discord.MessageContextMenuCommandInteraction} interaction
   */
  async execute(interaction) {
    const translate = require("@vitalets/google-translate-api");
    const msg = interaction.targetMessage;
    const user = interaction.user;
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
        res = await translate(msg.content, {
          to: "en",
          autoCorrect: true,
        });

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
        return await interaction.reply({
          embeds: array,
          content: `${res.text}`,
          ephemeral: true,
        });
      } else {
        return await interaction.reply({
          embeds: array,
          content: `${res.text}`,
          ephemeral: true,
        });
      }
    }

    async function translateEmbed() {
      let array = [];
      for (let embed of msg.embeds) {
        let Embed = new Discord.EmbedBuilder().setColor("Blue");
        if (embed.title) Embed.setTitle(await translateLanguage(embed.title));
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

    await interaction.reply({
      embeds: [embed],
      content: `${res.text}`,
      ephemeral: true,
    });
  },
};
