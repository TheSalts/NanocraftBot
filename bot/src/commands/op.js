const { SlashCommandBuilder } = require("@discordjs/builders");
const path = require("path");
const config = require("../config.json");
const Util = require("../util/util");
const { PermissionsBitField } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("op")
    .setDescription("Add op.")
    .setDescriptionLocalizations({
      "en-US": "Add whitelist to Nanocraft creative server.",
      ko: "나노크래프트 크리에이티브 서버에 오피를 추가합니다.",
    })
    .addStringOption((option) =>
      option
        .setName("nickname")
        .setNameLocalizations({ "en-US": "nickname", ko: "닉네임" })
        .setDescription("Minecraft nickname")
        .setDescriptionLocalizations({
          "en-US": "Minecraft nickname",
          ko: "마인크래프트 닉네임",
        })
        .setRequired(true)
    ),
  /**
   *
   * @param {Discord.CommandInteraction} interaction
   */
  async execute(interaction, logchannel) {
    const lang = Util.setLang(interaction.locale);
    await interaction.deferReply({ ephemeral: true });
    const Discord = require("discord.js");
    const fs = require("fs");
    const util = require("minecraft-server-util");

    const nickname = interaction.options.getString("nickname");

    const list = Util.readFile(path.resolve("./data/teamlist.json"));

    var serverport = 25001;
    var command = `op ${nickname}`;
    var server = config.rconip;
    var rconpassword = config.rconpw;

    fs.writeFileSync("./data/teamlist.json", JSON.stringify(list));

    const client = new util.RCON(server, {
      port: serverport,
      password: rconpassword,
    });

    let message;
    if (lang.language === "ko") message = "OP가 지급되었습니다.";
    else message = "Added OP.";

    await client
      .connect(server, serverport)
      .then(async () => {
        await client.login(rconpassword);
        let msg = await client.execute(command);
        if (interaction.member.roles.cache.has("987045537624784931")) {
          await client.execute(`lp user ${nickname} parent set trusted`);
          msg = msg + "\n 월드에딧 권한이 지급되었습니다.";
        }
        const infoEmbed = new Discord.EmbedBuilder()
          .setTitle(message)
          .setAuthor(nickname)
          .setDescription(msg);
        await interaction.editReply({
          content: lang.whitelist.success,
          embeds: [infoEmbed],
        });
        await logchannel.send({ content: lang.whitelist.success, embeds: [infoEmbed] });
      })
      .catch((error) => {
        const Err = new Discord.EmbedBuilder()
          .setTitle("Error")
          .setDescription(
            lang.whitelist.error.replaceAll("${error.stack}", error.stack)
          )
          .setColor("#FF0000");
        interaction.editReply({
          embeds: [Err],
          ephemeral: true,
        });
      });
  },
};
