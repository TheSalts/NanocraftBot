const { SlashCommandBuilder } = require("@discordjs/builders");
const quick = require("../util/quick");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("startserver")
    .setNameLocalizations({ "en-US": "startserver", ko: "서버실행" })
    .setDescription("Start minecraft server.")
    .setDescriptionLocalizations({
      "en-US": "Start minecraft server.",
      ko: "마인크래프트 서버를 실행합니다.",
    })
    .addStringOption((option) =>
      option
        .setName("server")
        .setNameLocalizations({ "en-US": "server", ko: "서버" })
        .setDescription("서버")
        .setRequired(true)
        .setChoices(
          { name: "CREATIVE", value: "크리에이티브" },
          { name: "SMP", value: "서바이벌" }
        )
    ),
  async execute(interaction, logchannel, alertchn) {
    const Discord = require("discord.js");
    const server = interaction.options.getString("server");
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
      return quick.sendPermissionErrorEmbed(
        interaction,
        "NANOCRAFT SMP | Trial Member"
      );

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
