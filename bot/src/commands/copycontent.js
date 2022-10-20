const { SlashCommandBuilder } = require("@discordjs/builders");
const quick = require("../util/quick.js");
const { PermissionsBitField } = require("discord.js");
const util = require("../util/util.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
    .setName("scrap")
    .setNameLocalizations({ "en-US": "scrap", ko: "스크랩" })
    .setDescription("Fetch channel messages with thread.")
    .setDescriptionLocalizations({
      "en-US": "Fetch channel messages with thread.",
      ko: "채널에서 메시지를 가져옵니다.",
    })
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setNameLocalizations({ "en-US": "channel", ko: "채널" })
        .setDescription("channel")
        .setDescriptionLocalizations({ "en-US": "channel", ko: "채널" })
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("description")
        .setNameLocalizations({ "en-US": "description", ko: "설명" })
        .setDescription("description")
        .setDescriptionLocalizations({ "en-US": "description", ko: "설명" })
        .setRequired(true)
    )
    .addRoleOption((option) =>
      option
        .setName("role")
        .setNameLocalizations({ "en-US": "role", ko: "역할" })
        .setDescription("role")
        .setDescriptionLocalizations({ "en-US": "role", ko: "역할" })
        .setRequired(false)
    )
    .addIntegerOption((option) =>
      option
        .setName("count")
        .setNameLocalizations({ "en-US": "count", ko: "메시지수" })
        .setDescription(
          "Determines the number of messages to fetch. | Default: 100 | Max: 100"
        )
        .setDescriptionLocalizations({
          "en-US":
            "Determines the number of messages to fetch. | Default: 100 | Max: 100",
          ko: "가져올 메시지의 수를 정합니다. 기본값은 100이며 최대 100까지 가능합니다.",
        })
        .setRequired(false)
    )
    .addUserOption((option) =>
      option
        .setName("votemember")
        .setNameLocalizations({ "en-US": "votemember", ko: "투표멤버" })
        .setDescription("Send automatically member request vote.")
        .setDescriptionLocalizations({
          "en-US": "Send automatically member request vote.",
          ko: "자동으로 멤버 신청 투표를 보냅니다.",
        })
        .setRequired(false)
    ),
  /**
   *
   * @param {Discord.CommandInteraction} interaction
   * @returns
   */
  async execute(interaction) {
    const lang = util.setLang(interaction.locale);
    if (interaction.channel.isThread()) {
      await interaction.reply({
        ephemeral: true,
        content: lang.scrap.alert.inthread,
      });
      return;
    }
    await interaction.reply(lang.scrap.alert.load);
    const Discord = require("discord.js");
    const wait = require("node:timers/promises").setTimeout;
    const channel = interaction.options.getChannel("channel");
    const lm = interaction.options.getInteger("count");
    const role = interaction.options.getRole("role");
    const desc = interaction.options.getString("description");
    const trial = interaction.options.getUser("votemember");

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

        let embed = new Discord.EmbedBuilder().setColor("#2F3136");
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
      .setTitle(lang.scrap.embed.title)
      .setColor("#B266FF");
    if (role) Embeds.setDescription(desc + `\n<@&${role.id}>`);
    else Embeds.setDescription(desc);
    await thread.send({ embeds: [Embeds] }).then(() => {
      interaction.editReply(lang.scrap.alert.success);
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
