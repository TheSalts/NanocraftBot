const { SlashCommandBuilder } = require("@discordjs/builders");
const quick = require("../util/quick");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("메시지삭제")
    .setDescription("MOD만 사용 가능합니다.")

    .addIntegerOption((option) =>
      option
        .setName("메시지수")
        .setDescription("가져올 메시지의 수를 정합니다. 1~100까지 가능합니다.")
        .setRequired(true)
    ),
  async execute(interaction) {
    const Discord = require("discord.js");
    const lm = interaction.options.getInteger("메시지수");
    if (!interaction.member.roles.cache.some((role) => role.name === "MOD")) {
      return quick.sendPermissionErrorEmbed(interaction, "관리자");
    }
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
