const { ContextMenuCommandBuilder } = require("@discordjs/builders");
const {
  ApplicationCommandType,
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  PermissionsBitField,
} = require("discord.js");
const Discord = require("discord.js");
const util = require("../util/util");

module.exports = {
  data: new ContextMenuCommandBuilder()
    .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
    .setName("upload")
    .setNameLocalizations({ "en-US": "upload", ko: "업로드" })
    .setType(ApplicationCommandType.Message),
  /**
   * @param {Discord.MessageContextMenuCommandInteraction} interaction
   */
  async execute(interaction) {
    const lang = util.setLang(interaction.locale);
    if (!interaction.targetMessage.attachments.first()) {
      return await interaction.reply({
        ephemeral: true,
        content: lang.ticket.alert.notfile,
      });
    }
    const fileURL = interaction.targetMessage.attachments.first().url;
    const uploadModal = new ModalBuilder()
      .setCustomId("uploadNotion")
      .setTitle("노션 업로드");
    const title = new TextInputBuilder()
      .setCustomId("pagetitle")
      .setLabel("제목")
      .setValue(fileURL.substring(fileURL.lastIndexOf("/") + 1))
      .setStyle(TextInputStyle.Short)
      .setRequired(false);

    const type = new TextInputBuilder()
      .setCustomId("pagetype")
      .setLabel("유형")
      .setStyle(TextInputStyle.Short)
      .setPlaceholder("일반 | 프로젝트 참여 | 멤버 신청")
      .setValue("일반 | 프로젝트 참여 | 멤버 신청");
    const description = new TextInputBuilder()
      .setCustomId("pagedescription")
      .setLabel("설명")
      .setPlaceholder("부가 설명")
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(false);
    const url = new TextInputBuilder()
      .setCustomId("pagefileurl")
      .setLabel("파일 URL")
      .setStyle(TextInputStyle.Paragraph)
      .setValue(fileURL);
    const titlerow = new ActionRowBuilder().addComponents(title);
    const typerow = new ActionRowBuilder().addComponents(type);
    const desrow = new ActionRowBuilder().addComponents(description);
    const urlrow = new ActionRowBuilder().addComponents(url);
    uploadModal.addComponents(titlerow, typerow, desrow, urlrow);
    await interaction.showModal(uploadModal);
  },
};
