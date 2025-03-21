const Discord = require("discord.js");
const fs = require("fs");
const util = require("./util");

module.exports = {
  /**
   * @deprecated
   * @description Get Embed when user has no permission
   * @param {string} permissionName 권한 이름
   * @returns {Discord.Embed} PermissionEmbed
   */
  getPermissionErrorEmbed: function (permissionName) {
    if (permissionName) {
      return new Discord.EmbedBuilder()
        .setTitle("Error: 권한이 없습니다")
        .setColor("Red")
        .setDescription(
          `작업을 수행하려면 ${permissionName} 권한이 필요합니다.`
        );
    } else {
      return new Discord.EmbedBuilder()
        .setTitle("Error: 권한이 없습니다")
        .setColor("Red")
        .setDescription(`작업을 수행하려면 해당 권한이 필요합니다.`);
    }
  },
  /**
   * @description Send Embed when user has no permission
   * @param {Discord.Interaction|Discord.Channel|Discord.User} place 임베드를 보낼 곳
   * @param {string} permissionName 권한 이름
   */
  sendPermissionErrorEmbed: async function (place, permissionName) {
    if (place.locale) var lang = util.setLang(place.locale);
    let embed;
    if (permissionName) {
      embed = new Discord.EmbedBuilder()
        .setTitle(lang.quick.permission.no)
        .setColor("Red")
        .setDescription(
          lang.quick.permission.need.replaceAll(
            "${permissionName}",
            permissionName
          )
        );
    } else {
      embed = new Discord.EmbedBuilder()
        .setTitle(lang.quick.permission.no)
        .setColor("Red")
        .setDescription(lang.quick.permission.needany);
    }
    if (place.channel) {
      if (place.isRepliable()) {
        await place.followUp({ embeds: [embed], ephemeral: true });
      }
      else await place.reply({ embeds: [embed], ephemeral: true });
    } else await place.send({ embeds: [embed] });
  },
  /**
   * @deprecated
   * @description Get an Error Embed
   * @param {Error} error
   * @returns {Discord.Embed}
   */
  getErrorEmbed: function (error) {
    if (!error) throw new Error(`Param "error" is not an Error object`);
    return new Discord.EmbedBuilder()
      .setTitle("Error")
      .setColor("Red")
      .setDescription(
        `예기치 못한 오류가 발생했습니다.\n관리자에게 문의 바랍니다.\n\n${error.stack}`
      );
  },
  /**
   * @description Send an Error Embed
   * @type async function
   * @param {Discord.Interaction|Discord.Channel|Discord.User} place 임베드를 보낼 곳
   * @param {Error} error
   */
  sendErrorEmbed: async function (place, error) {
    if (place.locale) var lang = util.setLang(place.locale);
    let embed = new Discord.EmbedBuilder()
      .setTitle("Error")
      .setColor("Red")
      .setDescription(lang.quick.error)
      .addFields({ name: "Error description", value: `${error.stack}` });
    if (place.channel) {
      console.log(place.isRepliable())
      if (place.isRepliable()) {
        await place.followUp({ embeds: [embed], ephemeral: true });
      }
      else await place.reply({ embeds: [embed], ephemeral: true });
    } else await place.send({ embeds: [embed] });
  },
  /**
   * @deprecated
   * @description read file and if file does not exist, write file
   * @param {string} path 파일 위치
   * @returns
   */
  readFile: function (path) {
    if (typeof path !== "string")
      throw new Error(`Path must be string, not ${typeof path}`);
    if (!fs.existsSync(path)) fs.writeFileSync(path, JSON.stringify([]));
    let read = fs.readFileSync(path, "utf8");
    return JSON.parse(read);
  },
};
