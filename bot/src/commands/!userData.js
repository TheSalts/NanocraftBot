const { SlashCommandBuilder } = require("@discordjs/builders");
const Discord = require("discord.js");
const axios = require("axios");
const dataApi = require("../util/dataApi");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("유저")
    .setDescription("유저 정보를 표시합니다.")
    .addBooleanOption((option) =>
      option
        .setName("캐시")
        .setDescription(
          "캐시를 사용하여 빠르게 검색합니다. 최신 데이터가 반영되지 않을 수 있습니다."
        )
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("이름")
        .setDescription(
          "마인크래프트 닉네임, 디스코드 태그, 디스코드 별명, uuid, 디스코드 id를 검색할 수 있습니다."
        )
        .setRequired(true)
    ),
  /**
   * @param {Discord.CommandInteraction} interaction
   */
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const nickname = interaction.options.getString("닉네임");
    const cache = interaction.options.getBoolean("캐시");
    const userData = await dataApi.getAll();
    /**
     * @type {[{discordTag: string, discordNickname: string, discordId: string, minecraftName: string, minecraftUUID: string}]}
     */
    let data = [];
    if (cache) {
      userData.forEach((userdata) => {
        data.push(eval(userdata.value));
      });
    } else {
    }
  },
};
