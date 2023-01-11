const { SlashCommandBuilder } = require("@discordjs/builders");
const fs = require("fs");
const Discord = require("discord.js");
const quick = require("../util/quick.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("불러오기")
    .setDescription("불러오기")

    .addSubcommand((subcommand) =>
      subcommand
        .setName("추가")
        .setDescription("불러오기를 추가합니다.")
        .addStringOption((option) =>
          option.setName("타이틀").setDescription("타이틀").setRequired(true)
        )
        .addStringOption((option) =>
          option.setName("설명").setDescription("설명").setRequired(true)
        )
        .addStringOption((option) =>
          option.setName("url").setDescription("url").setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("삭제")
        .setDescription("불러오기를 삭제합니다.")
        .addStringOption((option) =>
          option.setName("타이틀").setDescription("타이틀").setRequired(true)
        )
    ),
  // .addStringOption((option) =>
  //   option
  //     .setName("테크니컬디스코드")
  //     .setDescription("테크니컬 디스코드 URL")
  //     .setRequired(true)
  //     .setAutocomplete(true)
  // ),
  async execute(interaction) {
    let load = util.readFile("./data/load.json");

    if (interaction.options.getSubcommand() == "추가") {
      const title = interaction.options.getString("타이틀");
      const des = interaction.options.getString("설명");
      const url = interaction.options.getString("url");
      let embed = new Discord.MessageEmbed()
        .setTitle(title)
        .setDescription(des)
        .setURL(url);
      load.push({ title: title, description: des, url: url });
      fs.writeFileSync("./data/load.json", JSON.stringify(load));
      interaction.reply({
        embeds: [embed],
        content: "타이틀이 성공적으로 추가되었어요.",
      });
    } else if (interaction.options.getSubcommand() == "삭제") {
      const title = interaction.options.getString("타이틀");
      for (let i = 0; i < load.length; i++) {
        if (load[i].title == title) {
          load.splice(i, 1);
          break;
        }
      }
      fs.writeFileSync("./data/load.json", JSON.stringify(load));
      interaction.reply(`**${title}**이 삭제되었어요.`);
    } else {
    }
  },
};
