const { SlashCommandBuilder } = require("@discordjs/builders");
const { PermissionsBitField } = require("discord.js");
const Discord = require("discord.js");
const quick = require("../util/quick");
const utils = require("../util/util");

module.exports = {
  data: new SlashCommandBuilder()
    .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
    .setName("command")
    .setDescription("Use minecraft command to server.")
    .setDescriptionLocalizations({
      "en-US": "Use minecraft command to server.",
      ko: "마인크래프트 서버에 명령어를 사용합니다.",
    })
    .addStringOption((option) =>
      option
        .setName("server")
        .setNameLocalizations({ "en-US": "server", ko: "서버" })
        .setDescription("A minecraft server to execute command")
        .setDescriptionLocalizations({
          "en-US": "A minecraft server to execute command",
          ko: "명령어를 실행할 서버",
        })
        .setRequired(true)
        .setChoices(
          { name: "SMP", value: "SMP" }, //8863
          { name: "CREATIVE", value: "크리에이티브" }, //8865
          { name: "PUBLIC", value: "퍼블릭" }
        )
    )
    .addStringOption((option) =>
      option
        .setName("command")
        .setNameLocalizations({ "en-US": "command", ko: "명령어" })
        .setDescription("Command")
        .setDescriptionLocalizations({ "en-US": "Command", ko: "명령어" })
        .setRequired(true)
    ),
  /**
   *
   * @param {Discord.CommandInteraction} interaction
   * @returns
   */
  async execute(interaction) {
    const lang = utils.setLang(interaction.locale);
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

    const command = interaction.options.getString("command");
    const util = require("minecraft-server-util");
    const serverIp = config.rconip;
    const serverOpt = interaction.options.getString("server");

    if (command.length == 1)
      return await interaction.editReply({
        ephemeral: true,
        content: lang.command.alert.wrongcommand,
      });

    const { NodeSSH } = require("node-ssh");

    await interaction.reply({
      ephemeral: true,
      content: lang.command.alert.load,
    });
    switch (serverOpt) {
      case "SMP":
        await rcon(8863);
        break;
      case "크리에이티브":
        await rcon(8865);
      case "퍼블릭":
        const publicPW = config.publicpw;
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
              console.log(result.stdout);
              console.log(result.stderr);
              let outEmbed = new Discord.EmbedBuilder()
                .setDescription(lang.command.embed.description)
                .addFields(
                  {
                    name: lang.command.embed.field_command,
                    value: `\`${command}\``,
                    inline: true,
                  },
                  {
                    name: "stdout",
                    value: `${result.stdout || "None"}`,
                    inline: true,
                  },
                  {
                    name: "stderr",
                    value: `${result.stderr || "None"}`,
                    inline: true,
                  },
                  {
                    name: lang.command.embed.field_server,
                    value: serverOpt,
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
              .setDescription(lang.command.embed.description)
              .addFields(
                {
                  name: lang.command.embed.field_command,
                  value: `\`${command}\``,
                  inline: true,
                },
                {
                  name: lang.command.embed.field_message,
                  value: `${message}`,
                  inline: true,
                },
                {
                  name: lang.command.embed.field_server,
                  value: serverOpt,
                  inline: true,
                }
              )
              .setColor("#66FF66")
              .setFooter({
                text: interaction.member.user.tag,
                iconURL: interaction.member.user.displayAvatarURL(),
              });
          } else {
            var cmdresult = new Discord.EmbedBuilder()
              .setDescription(lang.command.embed.description)
              .addFields(
                {
                  name: lang.command.embed.field_command,
                  value: `\`${command}\``,
                  inline: true,
                },
                {
                  name: lang.command.embed.field_server,
                  value: serverOpt,
                  inline: true,
                }
              )
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
