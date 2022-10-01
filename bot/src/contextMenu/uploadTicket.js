const { ContextMenuCommandBuilder } = require("@discordjs/builders");
const {
  ApplicationCommandType,
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require("discord.js");
const Discord = require("discord.js");
const quick = require("../util/quick");

module.exports = {
  data: new ContextMenuCommandBuilder()
    .setName("upload")
    .setType(ApplicationCommandType.Message),
  /**
   * @param {Discord.MessageContextMenuCommandInteraction} interaction
   */
  async execute(interaction) {
    if (
      !(
        interaction.member.roles.cache.some((role) => role.name === "STAFF") ||
        interaction.member.roles.cache.some((role) => role.name === "MOD")
      )
    ) {
      return quick.sendPermissionErrorEmbed(interaction, "관리자");
    }
    if (!interaction.targetMessage.attachments.first()) {
      return await interaction.reply({
        ephemeral: true,
        content: "파일이 올바르지 않습니다.",
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
