const { SlashCommandBuilder } = require("@discordjs/builders");
const config = require("../config.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("화이트리스트")
    .setDescription("화이트리스트를 추가합니다. MOD만 사용 가능합니다.")
    .addStringOption((option) =>
      option.setName("닉네임").setDescription("닉네임").setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("서버")
        .setDescription("서버")
        .setRequired(true)
        .addChoices(
          { name: "크리에이티브 서버", value: "크리에이티브 서버" },
          { name: "SMP 서버", value: "SMP 서버" }
        )
    )
    .addStringOption((option) =>
      option
        .setName("등록여부")
        .setDescription("등록 / 제거")
        .addChoices(
          { name: "등록", value: "등록" },
          { name: "제거", value: "제거" }
        )
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("teamtag")
        .setDescription("SMP서버에만 사용 가능합니다.")
        .setRequired(false)
        .addChoices(
          { name: "Nanocraft", value: "Nanocraft" },
          { name: "Partner", value: "Partner" },
          { name: "TrialMember", value: "TrialMember" },
          { name: "worldtour", value: "worldtour" }
        )
    ),
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const Discord = require("discord.js");
    const fs = require("fs");
    const util = require("minecraft-server-util");
    const permissionEmbed = new Discord.EmbedBuilder()
      .setTitle("에러: 권한이 없습니다.")
      .setColor("#FF0000");
    if (!interaction.member.roles.cache.some((role) => role.name === "MOD"))
      return await interaction.editReply({ embeds: [permissionEmbed] });
    const nickname = interaction.options.getString("닉네임");
    const addOrdelete = interaction.options.getString("등록여부");
    const address = interaction.options.getString("서버");

    if (!fs.existsSync("./data/teamlist.json"))
      fs.writeFileSync("./data/teamlist.json", []);
    const read = fs.readFileSync("./data/teamlist.json", "utf8");
    const list = JSON.parse(read);

    const infoEmbed = new Discord.EmbedBuilder()
      .setColor("Green")
      .setTimestamp()
      .addFields(
        { name: "닉네임", value: nickname, inline: true },
        { name: "MOD", value: interaction.member.user.tag, inline: true },
        { name: "서버", value: address, inline: true }
      );

    if (address == "크리에이티브 서버") {
      var serverport = 3389;
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

    var server = "182.231.209.148";
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
          content: "명령어를 성공적으로 실행했습니다.",
          embeds: [infoEmbed],
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
