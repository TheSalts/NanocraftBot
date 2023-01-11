const { SlashCommandBuilder } = require("@discordjs/builders");
const quick = require("../util/quick");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("상태수정")
    .setDescription("봇의 상태 메시지를 수정합니다. 관리자만 사용 가능합니다.")
    .addStringOption((option) =>
      option.setName("메시지").setDescription("메시지").setRequired(true)
    ),
  async execute(interaction, logchannel) {
    const Discord = require("discord.js");
    const option1 = interaction.options.getString("메시지");
    const fs = require("fs");

    if (!interaction.member.roles.cache.some((role) => role.name === "MOD"))
      return quick.sendPermissionErrorEmbed(interaction, "관리자");
    const read = JSON.parse(fs.readFileSync("config.json", "utf8"));
    console.log(read);

    const successEmbed = new Discord.EmbedBuilder()
      .setTitle("메시지가 성공적으로 변경되었습니다.")
      .setColor("#00FF80")
      .addFields(
        { name: "이전 메시지", value: read.message, inline: true },
        { name: "새로운 메시지", value: option1 }
      );
    const successlogEmbed = new Discord.EmbedBuilder()
      .setAuthor({ name: interaction.member.user.tag })
      .setThumbnail(interaction.member.user.avatarURL())
      .setTitle("상태 메시지를 변경했습니다.")
      .setColor("#00FF80")
      .addFields(
        { name: "이전 메시지", value: read.message, inline: true },
        { name: "새로운 메시지", value: option1 }
      )
      .setTimestamp();

    read.message = option1;
    fs.writeFileSync("config.json", JSON.stringify(read));
    await interaction.reply({ ephemeral: true, embeds: [successEmbed] });
    await logchannel.send({ embeds: [successlogEmbed] });
  },
};
