const { SlashCommandBuilder } = require("@discordjs/builders");
const path = require("path");
const config = require("../config.json");
const Util = require("../util/util");
const { PermissionsBitField } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
    .setName("whitelist")
    .setNameLocalizations({ "en-US": "whitelist", ko: "화이트리스트" })
    .setDescription("Add whitelist.")
    .setDescriptionLocalizations({
      "en-US": "Add whitelist.",
      ko: "화이트리스트를 추가합니다.",
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
    )
    .addStringOption((option) =>
      option
        .setName("server")
        .setNameLocalizations({ "en-US": "server", ko: "서버" })
        .setDescription("서버")
        .setRequired(true)
        .addChoices(
          { name: "CREATIVE", value: "크리에이티브 서버" },
          { name: "SMP", value: "SMP 서버" }
        )
    )
    .addStringOption((option) =>
      option
        .setName("method")
        .setNameLocalizations({ "en-US": "method", ko: "등록여부" })
        .setDescription("method")
        .setDescriptionLocalizations({ "en-US": "methdo", ko: "등록여부" })
        .addChoices(
          {
            name: "register",
            name_localizations: { "en-US": "register", ko: "등록" },
            value: "등록",
          },
          {
            name: "delete",
            name_localizations: { "en-US": "delete", ko: "제거" },
            value: "제거",
          }
        )
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("teamtag")
        .setDescription("Only can use in SMP server.")
        .setDescriptionLocalizations({
          "en-US": "Only can use in SMP server.",
          ko: "SMP서버에만 사용 가능합니다.",
        })
        .setRequired(false)
        .addChoices(
          { name: "Nanocraft", value: "Nanocraft" },
          { name: "Partner", value: "Partner" },
          { name: "TrialMember", value: "TrialMember" },
          { name: "worldtour", value: "worldtour" }
        )
    ),
  async execute(interaction) {
    const lang = Util.setLang(interaction.locale);
    await interaction.deferReply({ ephemeral: true });
    const Discord = require("discord.js");
    const fs = require("fs");
    const util = require("minecraft-server-util");

    const nickname = interaction.options.getString("nickname");
    const addOrdelete = interaction.options.getString("method");
    const address = interaction.options.getString("server");

    const list = util.readFile(path.resolve("./data/teamlist.json"));

    const infoEmbed = new Discord.EmbedBuilder()
      .setColor("Green")
      .setTimestamp()
      .addFields(
        {
          name: lang.whitelist.embed.field_nickname,
          value: nickname,
          inline: true,
        },
        { name: "MOD", value: interaction.member.user.tag, inline: true },
        {
          name: lang.whitelist.embed.field_server,
          value: address,
          inline: true,
        }
      );

    if (address == "크리에이티브 서버") {
      var serverport = 8865;
    } else if (address == "SMP 서버") {
      var serverport = 8863;
      let opt = interaction.options.getString("teamtag");
      if (opt == "Nanocraft") var team = "nanocraft";
      if (opt == "Partner") var team = "partner";
      if (opt == "TrialMember") var team = "trialmember";
      if (opt == "worldtour") var team = "worldtour";
    }

    if (addOrdelete == "등록") {
      var command = `whitelist add ${nickname}`;
      if (team)
        if (address == "SMP 서버") {
          var teamcmd = `team join ${team} ${nickname}`;
          if (team == "nanocraft") {
            var exist = false;
            for (let i = 0; i < list.length; i++) {
              if (list[i] == nickname) exist = true;
            }
            if (exist == false) list.push(nickname);
          }
        }
    }
    if (addOrdelete == "제거") {
      var command = `whitelist remove ${nickname}`;
      if (team)
        if (address == "SMP 서버") {
          var teamcmd = `team leave ${team} ${nickname}`;
          for (let i = 0; i < list.length; i++) {
            if (list[i] == nickname) list.splice(i, 1);
          }
        }
    }

    if (team) infoEmbed.addFields({ name: "Team", value: team });

    var server = config.rconip;
    var rconpassword = config.rconpw;

    fs.writeFileSync("./data/teamlist.json", JSON.stringify(list));

    const client = new util.RCON(server, {
      port: serverport,
      password: rconpassword,
    });

    await client
      .connect(server, serverport)
      .then(async () => {
        await client.login(rconpassword);
        await client.execute(command);
        if (teamcmd) await client.execute(teamcmd);
        await interaction.editReply({
          content: lang.whitelist.success,
          embeds: [infoEmbed],
        });
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
