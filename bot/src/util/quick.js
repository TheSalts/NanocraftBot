const Discord = require("discord.js");
const fs = require("fs");

module.exports = {
  /**
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
   * @type async function
   * @param {Discord.Interaction|Discord.Channel|Discord.User} place 임베드를 보낼 곳
   * @param {string} permissionName 권한 이름
   * @returns {Discord.Message}
   */
  sendPermissionErrorEmbed: async function (place, permissionName) {
    let embed;
    if (permissionName) {
      embed = new Discord.EmbedBuilder()
        .setTitle("Error: 권한이 없습니다")
        .setColor("Red")
        .setDescription(
          `작업을 수행하려면 ${permissionName} 권한이 필요합니다.`
        );
    } else {
      embed = new Discord.EmbedBuilder()
        .setTitle("Error: 권한이 없습니다")
        .setColor("Red")
        .setDescription(`작업을 수행하려면 해당 권한이 필요합니다.`);
    }
    return place.channel
      ? place.isRepliable()
        ? await place.reply({ embeds: [embed], ephemeral: true })
        : await place.followUp({ embeds: [embed], ephemeral: true })
      : await place.send({ embeds: [embed] });
  },
  /**
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
        `예기치 못한 오류가 발생했습니다.\n관리자에게 문의 바랍니다.\n${error.stack}`
      );
  },
  /**
   * @description Send an Error Embed
   * @type async function
   * @param {Discord.Interaction|Discord.Channel|Discord.User} place 임베드를 보낼 곳
   * @param {Error} error
   * @returns {Discord.Message}
   */
  sendErrorEmbed: async function (place, error) {
    if (!error) throw new Error(`Param "error" is not an Error object`);
    let embed = new Discord.EmbedBuilder()
      .setTitle("Error")
      .setColor("Red")
      .setDescription(
        `예기치 못한 오류가 발생했습니다.\n관리자에게 문의 바랍니다.\n${error.stack}`
      );
    return place.channel
      ? place.isRepliable()
        ? await place.reply({ embeds: [embed], ephemeral: true })
        : await place.followUp({ embeds: [embed], ephemeral: true })
      : await place.send({ embeds: [embed] });
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
