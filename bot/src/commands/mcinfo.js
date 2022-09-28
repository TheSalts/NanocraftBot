const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("서버정보")
    .setDescription("마인크래프트 서버 정보를 표시합니다.")
    .addStringOption((option) =>
      option.setName("서버주소").setDescription("서버 주소").setRequired(true)
    ),
  async execute(interaction /*,logchannel*/) {
    await interaction.deferReply({
      ephemeral: true,
    });
    const Discord = require("discord.js");
    const option1 = interaction.options.getString("서버주소");
    const rp = require("request-promise");
    const fs = require("fs");
    // const notopenlog = new Discord.EmbedBuilder()
    //   .setAuthor(interaction.member.user.tag)
    //   .setThumbnail(interaction.member.user.avatarURL())
    //   .setTitle(
    //     `${interaction.member.user.tag} (id ${interaction.member.user.id}) 님이 명령어를 사용하는데 실패했습니다.\n\`/서버주소 ${option1}\``
    //   )
    //   .addField("에러", "서버에게 응답을 받을 수 없습니다.", true)
    //   .setColor("#FF0000")
    //   .setFooter({ text: "by SaltBOT" })
    //   .setTimestamp();
    //get info
    rp(`http://ip-api.com/json/${option1}`, (err, res, body) => {
      if (res == undefined) {
        // logchannel.send({ embeds: [notopenlog] });
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
        // logchannel.send({ embeds: [notopenlog] });
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
        .setColor("#7F00FF")
        .setTitle(`${option1}`);
      //
      // const serverinfolog = new Discord.EmbedBuilder()
      //   .setAuthor(interaction.member.user.tag)
      //   .setThumbnail(interaction.member.user.avatarURL())
      //   .setImage(`https://api.mcsrvstat.us/icon/${option1}`)
      //   .setDescription(
      //     `${interaction.member.user.tag} (id ${interaction.member.user.id}) 님이 명령어를 사용했습니다.\n\`/서버정보 ${option1}\``
      //   )
      //   .addFields(
      //     { name: "온라인", value: `${online}/${max}` },
      //     { name: "플레이어", value: `${list}`, inline: true },
      //     { name: "버전", value: `${version}`, inline: true },
      //     { name: "MOTD", value: `${motd}`, inline: true },
      //     { name: "버킷", value: `${software}`, inline: true },
      //     {
      //       name: "국가",
      //       value: `${country}`,
      //       inline: true,
      //     },
      //     {
      //       name: "지역",
      //       value: `${city}`,
      //       inline: true,
      //     },
      //     {
      //       name: "isp",
      //       value: `${isp}`,
      //       inline: true,
      //     },
      //     {
      //       name: "org",
      //       value: `${org}`,
      //       inline: true,
      //     },
      //     {
      //       name: "플러그인",
      //       value: `${plugins}`,
      //       inline: true,
      //     },
      //     {
      //       name: "모드",
      //       value: `${mods}`,
      //       inline: true,
      //     }
      //   )
      //   .setColor("#7F00FF")
      //   .setTitle(`${option1}`);
      interaction.editReply({
        embeds: [serverinfo],
        content: "서버 정보를 찾았습니다",
        ephemeral: true,
      });
      // logchannel.send({ embeds: [serverinfolog] });
    });
  },
};
