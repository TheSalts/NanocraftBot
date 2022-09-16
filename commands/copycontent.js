const { SlashCommandBuilder } = require("@discordjs/builders");
const quick = require("../util/quick.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("스크랩")
    .setDescription("MOD만 사용 가능합니다.")
    .addChannelOption((option) =>
      option.setName("채널").setDescription("채널").setRequired(true)
    )
    .addStringOption((option) =>
      option.setName("설명").setDescription("설명").setRequired(true)
    )
    .addRoleOption((option) =>
      option.setName("역할").setDescription("역할").setRequired(false)
    )
    .addIntegerOption((option) =>
      option
        .setName("메시지수")
        .setDescription(
          "가져올 메시지의 수를 정합니다. 기본값은 100이며 최대 100까지 가능합니다."
        )
        .setRequired(false)
    )
    .addUserOption((option) =>
      option
        .setName("투표멤버")
        .setDescription("멤버 신청시 투표 자동 출력입니다.")
        .setRequired(false)
    ),
  /**
   *
   * @param {Discord.CommandInteraction} interaction
   * @returns
   */
  async execute(interaction) {
    if (interaction.channel.isThread()) {
      await interaction.reply({
        ephemeral: true,
        content: "스레드 안에서는 사용할 수 없는 기능이에요.",
      });
      return;
    }
    if (
      !(
        interaction.member.roles.cache.some((role) => role.name === "MOD") ||
        interaction.member.roles.cache.some((role) => role.name === "STAFF")
      )
    ) {
      return quick.sendPermissionErrorEmbed(interaction, "관리자");
    }
    await interaction.reply(
      "채널에서 메시지를 가져오는 중이에요...\n메시지를 업로드하는 동안 스레드에서 다른 메시지를 하지 말아주세요!"
    );
    const Discord = require("discord.js");
    const wait = require("node:timers/promises").setTimeout;
    const channel = interaction.options.getChannel("채널");
    const lm = interaction.options.getInteger("메시지수");
    const role = interaction.options.getRole("역할");
    const desc = interaction.options.getString("설명");
    const trial = interaction.options.getUser("투표멤버");

    let limit = 100;
    if (lm) {
      if (lm > 100) lm = 100;
      limit = lm;
    }

    const thread = await interaction.channel.threads.create({
      name: channel.name,
      autoArchiveDuration: 60,
      reason: channel.name,
    });

    await channel.messages.fetch({ limit: limit }).then(async (messages) => {
      for (const value of messages.reverse()) {
        let fileArray = [];
        let values = value[1];

        let embed = new Discord.EmbedBuilder().setColor("Blue");
        embed.setAuthor({
          name: values.author.tag,
          iconURL: values.author.displayAvatarURL(),
        });
        if (values.content) embed.setDescription(values.content);
        else embed.setDescription("[content]");
        if (values.attachments) {
          for (const attachment of values.attachments) {
            fileArray.push(attachment[1].url);
          }
        }
        embed.setTimestamp(values.createdTimestamp);
        let embedArray = [];
        if (values.embeds) embedArray = values.embeds;
        embedArray.push(embed);
        if (fileArray[0]) {
          await thread.send({ embeds: embedArray, files: fileArray });
        } else await thread.send({ embeds: embedArray });
      }
    });

    let Embeds = new Discord.EmbedBuilder()
      .setTitle("설명")
      .setColor("#B266FF");
    if (role) Embeds.setDescription(desc + `\n<@&${role.id}>`);
    else Embeds.setDescription(desc);
    await thread.send({ embeds: [Embeds] }).then(() => {
      interaction.editReply(
        "메시지를 성공적으로 불러왔어요!\n`12시간`뒤에 스레드가 자동으로 종료돼요."
      );
    });
    const vot = require("./vote.js");
    vot.vote(
      trial,
      interaction.channel,
      interaction.member.user.id,
      interaction.member.user.username
    );
    await wait(43200 * 1000).then(() => thread.delete());
  },
};
