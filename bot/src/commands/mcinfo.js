const { SlashCommandBuilder } = require("@discordjs/builders");
const util = require("../util/util");

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
    const lang = util.setLang(interaction.locale);
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
          content: lang.serverinfo.nofound,
          ephemeral: true,
        });
        return;
      }
      // display options
      var version = body.version;
      var online = body.players.online;
      var max = body.players.max;
      var list = body.players.list ?? "None";

      var plugins = body.plugins?.raw ?? "None";

      var mods = body.mods?.raw ?? "None";

      var motd = body.motd?.clean ?? "None";
      var software = body.software ?? "None";

      var country = bodys.country;
      var city = bodys.city;
      var isp = bodys.isp;
      var org = bodys.org;
      //embed
      const serverinfo = new Discord.EmbedBuilder()
        .setThumbnail(`https://api.mcsrvstat.us/icon/${option1}`)
        .addFields(
          { name: lang.serverinfo.fields.online, value: `${online}/${max}` },
          {
            name: lang.serverinfo.fields.player,
            value: `${list}`,
            inline: true,
          },
          {
            name: lang.serverinfo.fields.version,
            value: `${version}`,
            inline: true,
          },
          { name: "MOTD", value: `${motd}`, inline: true },
          {
            name: lang.serverinfo.fields.bukkit,
            value: `${software}`,
            inline: true,
          },
          {
            name: lang.serverinfo.fields.country,
            value: `${country}`,
            inline: true,
          },
          {
            name: lang.serverinfo.fields.city,
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
            name: lang.serverinfo.fields.plugin,
            value: `${plugins}`,
            inline: true,
          },
          {
            name: lang.serverinfo.fields.mod,
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
