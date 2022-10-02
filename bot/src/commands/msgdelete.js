const { SlashCommandBuilder } = require("@discordjs/builders");
const quick = require("../util/quick");
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
    const Discord = require("discord.js");
    const lm = interaction.options.getInteger("count");
    if (lm < 1)
      return await interaction.reply({
        ephemeral: true,
        content: "메시지 수는 1~100까지 가능해요",
      });
    if (lm > 100)
      return await interaction.reply({
        ephemeral: true,
        content: "메시지 수는 1~100까지 가능해요",
      });
    let deletedCount = 0;
    try {
      await interaction.channel
        .bulkDelete(lm)
        .then((messages) => (deletedCount = messages.size));
    } catch (e) {
      if (e.name === "DiscordAPIError[50034]") {
        let Embeds = new Discord.EmbedBuilder()
          .setTitle("메시지 삭제 실패")
          .setColor("Red")
          .setDescription(`2주일이 지난 메시지는 삭제할 수 없어요.`);
        return await interaction.reply({ ephemeral: true, embeds: [Embeds] });
      }
    }

    let Embeds = new Discord.EmbedBuilder()
      .setTitle("메시지 삭제됨")
      .setColor("Blue")
      .setDescription(`메시지 ${deletedCount}개가 관리자에 의해 삭제되었어요.`);
    let EmbedsMod = new Discord.EmbedBuilder()
      .setTitle("메시지 삭제됨")
      .setColor("Blue")
      .setDescription(`메시지 ${deletedCount}개를 성공적으로 삭제했어요.`);
    await interaction.channel.send({ embeds: [Embeds] });
    await interaction.reply({ ephemeral: true, embeds: [EmbedsMod] });
  },
};
