const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("서버실행")
    .setDescription("서버를 실행합니다.")
    .addStringOption((option) =>
      option
        .setName("서버")
        .setDescription("서버")
        .setRequired(true)
        .setChoices(
          { name: "크리에이티브", value: "크리에이티브" },
          { name: "서바이벌", value: "서바이벌" }
        )
    ),
  async execute(interaction, logchannel, alertchn) {
    const Discord = require("discord.js");
    const server = interaction.options.getString("서버");
    if (
      !(
        interaction.member.roles.cache.some((role) => role.name === "MOD") ||
        interaction.member.roles.cache.some(
          (role) => role.name === "NANOCRAFT SMP"
        ) ||
        interaction.member.roles.cache.some(
          (role) => role.name === "Trial Member"
        )
      )
    )
      return;

    const row = new Discord.ActionRowBuilder().addComponents(
      new Discord.ButtonBuilder()
        .setCustomId(`server_${server}`)
        .setLabel("확인")
        .setStyle(Discord.ButtonStyle.Secondary)
    );
    const embed = new Discord.EmbedBuilder()
      .setTitle("서버 실행")
      .setDescription(
        `**${interaction.member.user.username}**님이 **${server}** 서버를 시작하려고 합니다.\n이에 동의하시려면 아래 버튼을 누르십시오.`
      )
      .setColor("#7F00FF");

    await interaction.reply({ components: [row], embeds: [embed] });
  },
};
