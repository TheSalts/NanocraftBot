const { SlashCommandBuilder } = require("@discordjs/builders");
const fs = require("fs");
const Discord = require("discord.js");
const quick = require("../util/quick.js");
const util = require("../util/util");
const path = require("path");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("warncheck")
    .setNameLocalizations({ "en-US": "warncheck", ko: "경고확인" })
    .setDescription("check warn count.")
    .setDescriptionLocalizations({
      "en-US": "check warn count.",
      ko: "경고를 확인합니다.",
    })
    .addUserOption((option) =>
      option
        .setName("member")
        .setNameLocalizations({ "en-US": "member", ko: "대상" })
        .setDescription("member")
        .setDescriptionLocalizations({ "en-US": "member", ko: "대상" })
        .setRequired(false)
    ),
  async execute(interaction) {
    const lang = util.setLang(interaction.locale);
    let badalert = util.readFile(path.resolve("./data/badalert.json"));
    const useroption = interaction.options.getUser("member");

    if (useroption) var user = useroption;
    else var user = interaction.user;

    let embed = new Discord.EmbedBuilder()
      .setTitle(lang.warncheck.embed.title)
      .setColor("Blue")
      .setAuthor({
        name: user.username,
        iconURL: user.displayAvatarURL(),
      })
      .setDescription(
        lang.warncheck.embed.description
          .replaceAll("${user.username}", user.username)
          .replaceAll("${count}", await checkAlert(user.id))
      );

    async function checkAlert(userid) {
      let count = badalert.filter((element) => userid === element).length;
      return count;
    }

    await interaction.reply({
      ephemeral: true,
      embeds: [embed],
    });
  },
};
