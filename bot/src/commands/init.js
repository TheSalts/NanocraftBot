const { SlashCommandBuilder } = require("@discordjs/builders");
const Discord = require("discord.js");
const fs = require("fs");
const path = require("path");
const util = require("../util/util");
const { PermissionsBitField } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageChannels)
    .setName("init")
    .setNameLocalizations({ "en-US": "init", ko: "초기설정" })
    .setDescription("Connect with NANOCRAFT SMP.")
    .setDescriptionLocalizations({
      "en-US": "Connect with NANOCRAFT SMP.",
      ko: "NANOCRAFT SMP와 연동합니다.",
    }),
  /**
   * @param {Discord.CommandInteraction} interaction
   */
  async execute(interaction) {
    const lang = util.setLang(interaction.locale);
    await interaction.deferReply({ ephemeral: true });
    //초기설정 여러번
    if (fs.existsSync("./data/publicCategory.json")) {
      let reads = fs.readFileSync("./data/publicCategory.json", "utf8");
      /**
       * @type {Array}
       */
      let publicCategoryRead = JSON.parse(reads);
      for (let i = 0; i < publicCategoryRead.length; i++) {
        if (publicCategoryRead[i].guildId === interaction.guildId) {
          publicCategoryRead.splice(i, 1);
          fs.writeFileSync(
            "./data/publicCategory.json",
            JSON.stringify(publicCategoryRead)
          );
          await interaction.reply({
            ephemeral: true,
            content: lang.init.alert,
          });
          break;
        }
      }
    }

    let category = await interaction.guild.channels.create({
      name: "퍼블릭 서버",
      type: Discord.ChannelType.GuildCategory,
      permissionOverwrites: [
        {
          id: interaction.guild.roles.everyone,
          deny: [PermissionsBitField.Flags.SendMessages],
        },
      ],
    });
    let partnerDiscord = await interaction.guild.channels.create({
      name: "📣│파트너-디스코드",
      type: Discord.ChannelType.GuildText,
      parent: category,
    });
    let publicNotice = await interaction.guild.channels.create({
      name: "📢│퍼블릭서버-공지",
      type: Discord.ChannelType.GuildText,
      parent: category,
    });
    let publicPatch = await interaction.guild.channels.create({
      name: "📕│퍼블릭서버-패치노트",
      type: Discord.ChannelType.GuildText,
      parent: category,
    });
    let publicServer = await interaction.guild.channels.create({
      name: "✅│야생-서버",
      type: Discord.ChannelType.GuildText,
      parent: category,
    });
    const Embed = new Discord.EmbedBuilder()
      .setTitle("퍼블릭 서버 문의")
      .setDescription("문의하시려면 아래 버튼을 클릭해주세요")
      .setColor("Blue");
    const row = new Discord.ActionRowBuilder().addComponents(
      new Discord.ButtonBuilder()
        .setCustomId("publicTicket")
        .setLabel("문의")
        .setStyle(Discord.ButtonStyle.Secondary)
        .setEmoji("📩")
    );
    let publicCategory = util.readFile(
      path.resolve("./data/publicCategory.json")
    );
    publicCategory.push({
      guildId: interaction.guildId,
      category: category,
      number: 0,
    });
    await publicServer.send({ embeds: [Embed], components: [row] });
    fs.writeFileSync(
      "./data/publicCategory.json",
      JSON.stringify(publicCategory)
    );
    await interaction.editReply({
      ephemeral: true,
      content: lang.init.success
        .replaceAll("${category.id}", category.id)
        .replaceAll("${partnerDiscord.id}", partnerDiscord.id)
        .replaceAll("${publicNotice.id}", publicNotice.id)
        .replaceAll("${publicPatch.id}", publicPatch.id)
        .replaceAll("${publicServer.id}", publicServer.id),
    });
  },
};
