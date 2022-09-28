require("dotenv").config();
const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  EmbedBuilder,
} = require("discord.js");
const fetch = require("node-fetch");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("secure_link")
    .setDescription("Nanocraft 보안 단축 링크")
    .addSubcommand((subcommand) =>
      subcommand.setName("add").setDescription("단축 링크 생성")
    )
    .addSubcommand((subcommand) =>
      subcommand.setName("list").setDescription("단축 링크 목록 확인")
    ),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    if (subcommand === "add") {
      const modal = new ModalBuilder()
        .setCustomId("shortUrlGen")
        .setTitle("단축 링크 생성");

      const originalUrlInput = new TextInputBuilder()
        .setCustomId("originalUrlInput")
        .setLabel("원본 URL")
        .setPlaceholder("원본 URL값을 입력하세요")
        .setStyle(TextInputStyle.Short);

      const expirationTimeInput = new TextInputBuilder()
        .setCustomId("expirationTimeInput")
        .setLabel("링크 유효 시간")
        .setPlaceholder("유효 시간을 입력하세요 (HH:MM 형식)")
        .setStyle(TextInputStyle.Short);

      const originalUrlInputRow = new ActionRowBuilder().addComponents(
        originalUrlInput
      );
      const expirationTimeInputRow = new ActionRowBuilder().addComponents(
        expirationTimeInput
      );

      modal.addComponents(originalUrlInputRow, expirationTimeInputRow);

      await interaction.showModal(modal);
    }
    if (subcommand === "list") {
      let noExpiration = [];
      let data;

      await fetch(`http://localhost:${process.env.PORT}/api/info`)
        .then((res) => res.json())
        .then((json) => {
          data = json;
        });

      for (let i = 0; i < data.length; i++) {
        const date = new Date();
        const expirationTime = new Date(data[i].expirationTime);
        if (expirationTime > date) {
          noExpiration.push(data[i]);
        }
      }

      console.log(noExpiration);

      const e = new EmbedBuilder()
        .setTitle("단축 링크 목록")
        .setColor(0x00ae86);

      let description = "";
      for (let i = 0; i < noExpiration.length; i++) {
        description +=
          "```\n" +
          `${i + 1}. ID: ${noExpiration[i].shortUrlId} | URL: ${
            noExpiration[i].originalUrl
          } (${noExpiration[i].expirationTime})` +
          "\n```";
      }

      if (description.length == 0) {
        description = "```\n단축 링크가 없습니다.\n```";
      }
      e.setDescription(description);

      return interaction.reply({ embeds: [e] });
    }
  },
};
