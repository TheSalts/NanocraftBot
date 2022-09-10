const { SlashCommandBuilder } = require("@discordjs/builders");
const fs = require("fs");
const Discord = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("경고확인")
    .setDescription("경고를 확인합니다.")
    .addUserOption((option) =>
      option.setName("대상").setDescription("대상").setRequired(false)
    ),
  async execute(interaction) {
    let read = fs.readFileSync("./data/badalert.json", "utf8");
    let readjson = JSON.parse(read);
    const useroption = interaction.options.getUser("대상");

    if (useroption) var user = useroption;
    else var user = interaction.user;

    if (!fs.existsSync("./data/badalert.json")) {
      let embed = new Discord.EmbedBuilder()
        .setTitle("경고 확인")
        .setColor("Blue")
        .setAuthor({
          name: user.username,
          iconURL: user.displayAvatarURL(),
        })
        .setDescription(user.username + "님은 경고가 **0**개에요.");
      return await interaction.reply({
        ephemeral: true,
        embeds: [embed],
      });
    }

    let embed = new Discord.EmbedBuilder()
      .setTitle("경고 확인")
      .setColor("Blue")
      .setAuthor({
        name: user.username,
        iconURL: user.displayAvatarURL(),
      })
      .setDescription(
        user.username +
          "님은 경고가 **" +
          ((await checkAlert(user.id)) + "**개에요.")
      );

    async function checkAlert(userid) {
      let count = readjson.filter((element) => userid === element).length;
      return count;
    }

    await interaction.reply({
      ephemeral: true,
      embeds: [embed],
    });
  },
};
