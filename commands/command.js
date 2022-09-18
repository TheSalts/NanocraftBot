const { SlashCommandBuilder } = require("@discordjs/builders");
const Discord = require("discord.js");
const quick = require("../util/quick");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("command")
    .setDescription("서버에 명령어를 사용합니다.")
    .addStringOption((option) =>
      option
        .setName("서버")
        .setDescription("실행할 서버")
        .setRequired(true)
        .setChoices(
          { name: "SMP", value: "SMP" }, //8863
          { name: "크리에이티브", value: "크리에이티브" },
          { name: "퍼블릭", value: "퍼블릭" }
        )
    )
    .addStringOption((option) =>
      option.setName("명령어").setDescription("실행할 명령어").setRequired(true)
    ),
  /**
   *
   * @param {Discord.CommandInteraction} interaction
   * @returns
   */
  async execute(interaction) {
    if (interaction.member.roles.cache.some((role) => role.name === "MOD")) {
    } else if (
      interaction.member.roles.cache.some(
        (role) => role.name === "NANOCRAFT SMP"
      )
    ) {
    } else {
      return quick.sendPermissionErrorEmbed("NANOCRAFT SMP");
    }

    const config = require("../config.json");

    const command = interaction.options.getString("명령어");
    const util = require("minecraft-server-util");
    const serverIp = "182.231.209.148";
    const serverOpt = interaction.options.getString("서버");

    if (command.length == 1)
      return await interaction.editReply({
        ephemeral: true,
        content: "잘못된 명령어 입니다!",
      });

    const { NodeSSH } = require("node-ssh");

    await interaction.reply({
      ephemeral: true,
      content: "명령어를 실행하는 중...",
    });
    switch (serverOpt) {
      case "SMP":
        await rcon(8863);
        break;
      case "크리에이티브":
        return await interaction.editReply({
          ephemeral: true,
          content: "크리에이티브 서버는 이용이 불가합니다.",
        });
      case "퍼블릭":
        const publicPW = "nanocraft11!!public";
        await ssh(1103, publicPW, "public");
        break;
    }

    /**
     * @description connect ssh
     * @param {number} port
     * @param {string} pw
     * @param {string} instance
     */
    async function ssh(port, pw, instance) {
      const ssh = new NodeSSH();
      ssh
        .connect({
          host: serverIp,
          username: "root",
          port: port,
          password: pw,
        })
        .then(() => {
          ssh
            .execCommand(`screen -S ${instance} -X stuff '${command}\n'`)
            .then(async (result) => {
              let outEmbed = new Discord.EmbedBuilder()
                .setDescription("명령어를 성공적으로 실행했습니다.")
                .addFields(
                  {
                    name: "명령어",
                    value: `\`${command}\``,
                    inline: true,
                  },
                  {
                    name: "stdout",
                    value: `${result.stdout ?? "없음"}`,
                    inline: true,
                  },
                  {
                    name: "stderr",
                    value: `${result.stderr ?? "없음"}`,
                    inline: true,
                  }
                )
                .setColor("#66FF66")
                .setFooter({
                  text: interaction.member.user.tag,
                  iconURL: interaction.member.user.displayAvatarURL(),
                });
              await interaction.editReply({
                ephemeral: true,
                embeds: [outEmbed],
              });
            });
        })
        .catch(async (error) => {
          await quick.sendErrorEmbed(interaction, error);
        });
    }

    async function rcon(port) {
      const client = new util.RCON(serverIp, {
        port: port,
        password: config.rconpw,
      });

      await client
        .connect(serverIp, port)
        .then(async () => {
          await client.login(config.rconpw);
          const message = await client.execute(command);
          if (message) {
            var cmdresult = new Discord.EmbedBuilder()
              .setDescription("명령어를 성공적으로 실행했습니다.")
              .addFields(
                {
                  name: "명령어",
                  value: `\`${command}\``,
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
                value: `\`${command}\``,
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
        .catch(async (error) => {
          await quick.sendErrorEmbed(interaction, error);
        });
    }
  },
};
