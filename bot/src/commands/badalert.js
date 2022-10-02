const { SlashCommandBuilder } = require("@discordjs/builders");
const wait = require("node:timers/promises").setTimeout;
const util = require("../util/util");
const { PermissionsBitField } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
    .setName("warn")
    .setDescription("warn")
    .setNameLocalizations({
      "en-US": "warn",
      ko: "경고",
    })
    .setDescriptionLocalizations({
      "en-US": "Warn user.",
      ko: "유저를 경고합니다.",
    })
    .addUserOption((option) =>
      option
        .setName("member")
        .setDescription("member")
        .setNameLocalizations({ "en-US": "member", ko: "대상" })
        .setDescriptionLocalizations({ "en-US": "member", ko: "대상" })
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("reason")
        .setNameLocalizations({ "en-US": "reason", ko: "사유" })
        .setDescriptionLocalizations({ "en-US": "reason", ko: "사유" })
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("count")
        .setDescription("count")
        .setNameLocalizations({ "en-US": "count", ko: "횟수" })
        .setDescriptionLocalizations({ "en-US": "count", ko: "횟수" })
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("thread_expiration_time")
        .setDescription("Default: 12 hours")
        .setNameLocalizations({
          "en-US": "thread_expiration_time",
          ko: "스레드유지기간",
        })
        .setDescriptionLocalizations({
          "en-US": "Default: 12 hours",
          ko: "기본값: 12시간",
        })
        .setRequired(false)
    ),
  async execute(interaction, logchannel, alertchn) {
    const lang = util.setLang(interaction.locale);
    const path = require("path");
    const Discord = require("discord.js");
    const quick = require("../util/quick.js");
    const user = interaction.options.getUser("member");
    const reason = interaction.options.getString("reason");
    const alertnum = interaction.options.getInteger("count");
    var threadtime = interaction.options.getInteger("thread_expiration_time");
    const fs = require("fs");
    if (!interaction.member.roles.cache.some((role) => role.name === "MOD"))
      return quick.sendPermissionErrorEmbed(interaction, "MOD");
    if (alertnum < 0)
      return interaction.reply({
        ephemeral: true,
        content: "경고 횟수는 1 이상이어야 해요.",
      });

    if (!threadtime) threadtime = 12;

    if (threadtime < 1 || threadtime > 12)
      return interaction.reply({
        ephemeral: true,
        content: "스레드 유지 기간은 1~12 이어야 해요.",
      });

    let embed = new Discord.EmbedBuilder()
      .setColor("Red")
      .setAuthor({ name: user.tag, iconURL: user.displayAvatarURL() })
      .setTitle("제재 내역")
      .addFields(
        {
          name: "관리자",
          value: `<@${interaction.user.id}>`,
          inline: true,
        },
        {
          name: "사유",
          value: `${reason}`,
          inline: true,
        },
        {
          name: "경고 횟수",
          value: `${alertnum}`,
          inline: true,
        }
      );

    let badalert = util.readFile(path.resolve("./data/badalert.json"));

    for (let i = 0; i < alertnum; i++) await badalert.push(user.id);

    fs.writeFileSync("./data/badalert.json", JSON.stringify(badalert));

    async function checkAlert(userid) {
      let count = badalert.filter((element) => userid === element).length;
      return count;
    }

    embed.addFields({
      name: "현재 경고횟수",
      value: `${await checkAlert(user.id)}`,
    });

    const row = new Discord.ActionRowBuilder().addComponents(
      new Discord.ButtonBuilder()
        .setCustomId("badalert")
        .setLabel("제재 취소")
        .setStyle(Discord.ButtonStyle.Danger)
    );

    alertchn.send({
      embeds: [embed.addFields({ name: "사용자 ID", value: user.id })],
      components: [row],
    });

    const thread = await alertchn.threads.create({
      name: `${user.tag} | 제재`,
      autoArchiveDuration: 1440,
      reason: `${reason}`,
    });

    thread.members.add(user.id);

    await thread.send({
      content: `안녕하세요 <@${user.id}>님!\n유저님이 관리자에 의해 제재되었어요.\n<#987045538249728001>를 다시 한번 읽어보시고 더욱 쾌적한 커뮤니티를 위해 힘써주시길 바랄게요.`,
      embeds: [embed],
    });

    await interaction.reply({
      ephemeral: true,
      content: `**${user.tag}**님을 제재했어요. <#987045538493001819>`,
      embeds: [embed],
    });

    await wait(threadtime * 1000 * 60).then(() => {
      thread.delete();
    });
  },
};
