const { SlashCommandBuilder } = require("@discordjs/builders");
const Discord = require("discord.js");
const fs = require("fs");
const path = require("path");
const util = require("../util/util");
const { PermissionsBitField } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageChannels)
    .setName("youtube")
    .setNameLocalizations({ "en-US": "youtube", ko: "유튜브" })
    .setDescription("Setting youtube notification config")
    .setDescriptionLocalizations({
      "en-US": "Setting youtube notification config",
      ko: "유튜브 알림을 설정합니다.",
    }),
  /**
   * @param {Discord.CommandInteraction} interaction
   */
  async execute(interaction) {
    const lang = util.setLang(interaction.locale);
    let data = util.readFile("./data/youtubeconfig.json");
  },
};
