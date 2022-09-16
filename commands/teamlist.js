const { SlashCommandBuilder } = require("@discordjs/builders");
const quick = require("../util/quick.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("nanocraft")
    .setDescription("나노크래프트 멤버를 확인합니다."),
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const Discord = require("discord.js");
    const embed = new Discord.EmbedBuilder().setColor("Blue");
    const list = quick.readFile("./data/teamlist.json");

    var emojis = [];
    function emojilist(value) {
      emojis.push(value);
    }
    for (let i = 0; i < list.length; i++) {
      await interaction.guild.emojis
        .create(`https://mc-heads.net/avatar/${list[i]}`, list[i])
        .then((emoji) => {
          embed.addFields({
            name: `<:${list[i]}:${emoji.id}> ${list[i]}`,
            value: "None",
            inline: true,
          });
          emojilist(emoji);
        })
        .catch((err) => {
          console.error(err);
        });
    }
    await interaction.editReply({ embeds: [embed] });
    for (let i = 0; i < emojis.length; i++) {
      emojis[i].delete();
    }
  },
};
