const { SlashCommandBuilder } = require("@discordjs/builders");
const Discord = require("discord.js");
const fs = require("fs");
const path = require("path");
const quick = require("../util/quick.js");
const util = require("../util/util");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("초기설정")
    .setDescription("moderator only"),
  /**
   * @param {Discord.CommandInteraction} interaction
   */
  async execute(interaction) {
    const { PermissionsBitField } = require("discord.js");
    if (
      !interaction.member.permissions.has(
        PermissionsBitField.Flags.ManageChannels
      )
    )
      return quick.sendPermissionErrorEmbed(interaction, "채널 관리 권한");
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
            content:
              "초기 설정에 의해 문의 채널 연동이 초기화 되었어요.\n이전에 만든 문의는 이제 사용할 수 없어요.",
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
      content: `설정이 완료되었습니다.\n<#${category.id}>\n<#${partnerDiscord.id}>\n<#${publicNotice.id}>\n<#${publicPatch.id}>\n<#${publicServer.id}>`,
    });
  },
};
