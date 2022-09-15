const { SlashCommandBuilder } = require("@discordjs/builders");
const Discord = require("discord.js");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("rcon")
    .setDescription("RCON을 사용하여 명령어를 사용합니다.")
    .addStringOption((option) =>
      option
        .setName("서버")
        .setDescription("실행할 서버")
        .setRequired(true)
        .setChoices(
          { name: "SMP", value: "8863" },
          { name: "크리에이티브", value: "3389" }
        )
    )
    .addStringOption((option) =>
      option.setName("명령어").setDescription("실행할 명령어").setRequired(true)
    ),
  async execute(interaction) {
    if (interaction.member.roles.cache.some((role) => role.name === "MOD")) {
    } else if (
      interaction.member.roles.cache.some(
        (role) => role.name === "NANOCRAFT SMP"
      )
    ) {
    } else {
      const permissionEmbed = new Discord.EmbedBuilder()
        .setTitle("에러: 권한이 없습니다.")
        .setColor("#FF0000");
      return await interaction.reply({
        ephemeral: true,
        embeds: [permissionEmbed],
      });
    }

    const config = require("../config.json");

    const option2 = interaction.options.getString("명령어");
    const util = require("minecraft-server-util");
    const serverIp = "182.231.209.148";
    const serverPort = interaction.options.getString("서버") * 1;

    await interaction.reply({
      ephemeral: true,
      content: "명령어를 실행하는 중...",
    });
    if (option2.length == 1)
      return await interaction.editReply({
        ephemeral: true,
        content: "잘못된 명령어 입니다!",
      });

    const client = new util.RCON(serverIp, {
      port: serverPort,
      password: config.rconpw,
    });

    await client
      .connect(serverIp, serverPort)
      .then(async () => {
        await client.login(config.rconpw);
        const message = await client.execute(option2);
        if (message) {
          var cmdresult = new Discord.EmbedBuilder()
            .setDescription("명령어를 성공적으로 실행했습니다.")
            .addFields(
              {
                name: "명령어",
                value: `\`${option2}\``,
                inline: true,
              },
              { name: "메세지", value: `${message}`, inline: true }
            )
            .setColor("#66FF66")
            .setFooter({
              text: interaction.member.user.tag,
              iconURL: interaction.member.user.displayAvatarURL(),
            });
        } else {
          var cmdresult = new Discord.EmbedBuilder()
            .setDescription("명령어를 성공적으로 실행했습니다.")
            .addFields({
              name: "명령어",
              value: `\`${option2}\``,
              inline: true,
            })
            .setColor("#66FF66")
            .setFooter({
              text: interaction.member.user.tag,
              iconURL: interaction.member.user.displayAvatarURL(),
            });
        }
        await interaction.followUp({
          embeds: [cmdresult],
          ephemeral: false,
        });
      })
      .catch((error) => {
        const Err = new Discord.EmbedBuilder()
          .setTitle("Error")
          .setDescription(`예기치 못한 오류가 발생했습니다.\n${error.stack}`)
          .setColor("#FF0000");
        interaction.editReply({
          embeds: [Err],
          ephemeral: true,
        });
      });
  },
};
