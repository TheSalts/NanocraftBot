const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("serverinfo")
    .setNameLocalizations({ "en-US": "serverinfo", ko: "서버정보" })
    .setDescription("View minecraft server info.")
    .setDescriptionLocalizations({
      "en-US": "View minecraft server info.",
      ko: "마인크래프트 서버 정보를 표시합니다.",
    })
    .addStringOption((option) =>
      option
        .setName("address")
        .setNameLocalizations({ "en-US": "address", ko: "주소" })
        .setDescription("Minecraft server ip address")
        .setDescriptionLocalizations({
          "en-US": "Minecraft server ip address",
          ko: "마인크래프트 서버 주소",
        })
        .setRequired(true)
    ),
  async execute(interaction /*,logchannel*/) {
    await interaction.deferReply({
      ephemeral: true,
    });
    const Discord = require("discord.js");
    const option1 = interaction.options.getString("address");
    const rp = require("request-promise");
    const fs = require("fs");

    rp(`http://ip-api.com/json/${option1}`, (err, res, body) => {
      if (res == undefined) {
        interaction.editReply({
          content: "서버가 열려있지 않습니다!",
          ephemeral: true,
        });
        return;
      }
      fs.writeFileSync("./data/cache.json", body);
    });
    rp(`https://api.mcsrvstat.us/2/${option1}`, (err, res, bodya) => {
      let body = JSON.parse(bodya);
      let bodys = JSON.parse(fs.readFileSync("./data/cache.json", "utf8"));
      //online?
      if (body.online == false) {
        interaction.editReply({
          content: "서버가 열려있지 않습니다!",
          ephemeral: true,
        });
        return;
      }
      // display options
      var version = body.version;
      var online = body.players.online;
      var max = body.players.max;
      if (body.players.list) var list = body.players.list;
      else var list = "없음";
      if (body.plugins) var plugins = body.plugins.raw;
      else var plugins = "감지되지 않음";
      if (body.mods) var mods = body.mods.raw;
      else var mods = "감지되지 않음";
      var motd = body.motd.clean;
      if (body.software) var software = body.software;
      else var software = "감지되지 않음";
      var country = bodys.country;
      var city = bodys.city;
      var isp = bodys.isp;
      var org = bodys.org;
      //embed
      const serverinfo = new Discord.EmbedBuilder()
        .setThumbnail(`https://api.mcsrvstat.us/icon/${option1}`)
        .addFields(
          { name: "온라인", value: `${online}/${max}` },
          { name: "플레이어", value: `${list}`, inline: true },
          { name: "버전", value: `${version}`, inline: true },
          { name: "MOTD", value: `${motd}`, inline: true },
          { name: "버킷", value: `${software}`, inline: true },
          {
            name: "국가",
            value: `${country}`,
            inline: true,
          },
          {
            name: "지역",
            value: `${city}`,
            inline: true,
          },
          {
            name: "isp",
            value: `${isp}`,
            inline: true,
          },
          {
            name: "org",
            value: `${org}`,
            inline: true,
          },
          {
            name: "플러그인",
            value: `${plugins}`,
            inline: true,
          },
          {
            name: "모드",
            value: `${mods}`,
            inline: true,
          }
        )
        .setColor("#36393F")
        .setTitle(`${option1}`);
      interaction.editReply({
        embeds: [serverinfo],
        content: "서버 정보를 찾았습니다",
        ephemeral: true,
      });
    });
  },
};
