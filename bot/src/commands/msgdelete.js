const { SlashCommandBuilder } = require("@discordjs/builders");
const util = require("../util/util");
const { PermissionsBitField } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageChannels)
    .setName("deletemessage")
    .setNameLocalizations({ "en-US": "deletemessage", ko: "메시지삭제" })
    .setDescription("Delete messages.")
    .setDescriptionLocalizations({
      "en-US": "Delete messages.",
      ko: "메시지를 지웁니다.",
    })

    .addIntegerOption((option) =>
      option
        .setName("count")
        .setNameLocalizations({ "en-US": "count", ko: "메시지수" })
        .setDescription(
          "Determines the number of messages to delete. | Max: 100"
        )
        .setDescriptionLocalizations({
          "en-US": "Determines the number of messages to delete. | Max: 100",
          ko: "지울 메시지의 수를 정합니다. | 최대: 100",
        })
        .setRequired(true)
    ),
  async execute(interaction) {
    const lang = util.setLang(interaction.locale);
    const Discord = require("discord.js");
    const lm = interaction.options.getInteger("count");
    if (lm < 1)
      return await interaction.reply({
        ephemeral: true,
        content: lang.msgdelete.alert.countRule,
      });
    if (lm > 100)
      return await interaction.reply({
        ephemeral: true,
        content: lang.msgdelete.alert.countRule,
      });
    let deletedCount = 0;
    try {
      await interaction.channel
        .bulkDelete(lm)
        .then((messages) => (deletedCount = messages.size));
    } catch (e) {
      if (e.name === "DiscordAPIError[50034]") {
        let Embeds = new Discord.EmbedBuilder()
          .setTitle(lang.msgdelete.embed.failed.title)
          .setColor("Red")
          .setDescription(lang.msgdelete.embed.failed.description);
        return await interaction.reply({ ephemeral: true, embeds: [Embeds] });
      }
    }

    let Embeds = new Discord.EmbedBuilder()
      .setTitle(lang.msgdelete.embed.success.title)
      .setColor("Blue")
      .setDescription(
        lang.msgdelete.embed.success.descriptionAll.replaceAll(
          "${deletedCount}",
          deletedCount
        )
      );
    let EmbedsMod = new Discord.EmbedBuilder()
      .setTitle(lang.msgdelete.embed.success.title)
      .setColor("Blue")
      .setDescription(
        lang.msgdelete.embed.success.descriptionMod.replaceAll(
          "${deletedCount}",
          deletedCount
        )
      );
    await interaction.channel.send({ embeds: [Embeds] });
    await interaction.reply({ ephemeral: true, embeds: [EmbedsMod] });
  },
};
