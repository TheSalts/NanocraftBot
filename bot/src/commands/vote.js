const { SlashCommandBuilder } = require("@discordjs/builders");
const util = require("../util/util");
const Discord = require("discord.js");
const fs = require("fs");
const crypto = require("crypto");
const scheduler = require("node-schedule")

const data = new SlashCommandBuilder()
  .setName("vote")
  .setNameLocalizations({ "en-US": "vote", ko: "투표" })
  .setDescription("vote")
  .setDescriptionLocalizations({ "en-US": "vote", ko: "투표" })
  .addSubcommand((subcommand) =>
    subcommand
      .setName("start")
      .setNameLocalizations({ "en-US": "start", ko: "시작" })
      .setDescription("새로운 투표를 만듭니다.")
      .setDescriptionLocalizations({
        "en-US": "Create a new vote.",
        ko: "새로운 투표를 만듭니다.",
      })
      .addStringOption((option) =>
        option
          .setName("topic")
          .setNameLocalizations({ "en-US": "topic", ko: "주제" })
          .setDescription("topic")
          .setDescriptionLocalizations({ "en-US": "topic", ko: "주제" })
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
      .addStringOption((option) =>
        option
          .setName("option1")
          .setNameLocalizations({ "en-US": "option1", ko: "선택지1" })
          .setDescription("option")
          .setDescriptionLocalizations({ "en-US": "option", ko: "선택지" })
          .setRequired(true)
      )
      .addStringOption((option) =>
        option
          .setName("option2")
          .setNameLocalizations({ "en-US": "option2", ko: "선택지2" })
          .setDescription("option")
          .setDescriptionLocalizations({ "en-US": "option", ko: "선택지" })
          .setRequired(true)
      )
      .addIntegerOption((option) =>
        option
          .setName("term")
          .setNameLocalizations({ "en-US": "term", ko: "기간" })
          .setDescription("Default: 12 hours")
          .setDescriptionLocalizations({
            "en-US": "Default: 12 hours",
            ko: "기본값: 12시간",
          })
          .setRequired(false)
      )
      .addBooleanOption((option) =>
        option
          .setName("overlap")
          .setNameLocalizations({ "en-US": "overlap", ko: "중복" })
          .setDescription("overlap | Default: false")
          .setDescriptionLocalizations({
            "en-US": "overlap | Default: false",
            ko: "중복 | 기본값: false",
          })
          .setRequired(false)
      )

      .addStringOption((option) =>
        option
          .setName("option3")
          .setNameLocalizations({ "en-US": "option3", ko: "선택지3" })
          .setDescription("option")
          .setDescriptionLocalizations({ "en-US": "option", ko: "선택지" })
          .setRequired(false)
      )
      .addStringOption((option) =>
        option
          .setName("option4")
          .setNameLocalizations({ "en-US": "option4", ko: "선택지4" })
          .setDescription("option")
          .setDescriptionLocalizations({ "en-US": "option", ko: "선택지" })
          .setRequired(false)
      )
      .addStringOption((option) =>
        option
          .setName("option5")
          .setNameLocalizations({ "en-US": "option5", ko: "선택지5" })
          .setDescription("option")
          .setDescriptionLocalizations({ "en-US": "option", ko: "선택지" })
          .setRequired(false)
      )
      .addStringOption((option) =>
        option
          .setName("option6")
          .setNameLocalizations({ "en-US": "option6", ko: "선택지6" })
          .setDescription("option")
          .setDescriptionLocalizations({ "en-US": "option", ko: "선택지" })
          .setRequired(false)
      )
      .addStringOption((option) =>
        option
          .setName("option7")
          .setNameLocalizations({ "en-US": "option7", ko: "선택지7" })
          .setDescription("option")
          .setDescriptionLocalizations({ "en-US": "option", ko: "선택지" })
          .setRequired(false)
      )
      .addStringOption((option) =>
        option
          .setName("option8")
          .setNameLocalizations({ "en-US": "option8", ko: "선택지8" })
          .setDescription("option")
          .setDescriptionLocalizations({ "en-US": "option", ko: "선택지" })
          .setRequired(false)
      )
      .addStringOption((option) =>
        option
          .setName("option9")
          .setNameLocalizations({ "en-US": "option9", ko: "선택지9" })
          .setDescription("option")
          .setDescriptionLocalizations({ "en-US": "option", ko: "선택지" })
          .setRequired(false)
      )
      .addStringOption((option) =>
        option
          .setName("option10")
          .setNameLocalizations({ "en-US": "option10", ko: "선택지10" })
          .setDescription("option")
          .setDescriptionLocalizations({ "en-US": "option", ko: "선택지" })
          .setRequired(false)
      )
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("stop")
      .setNameLocalizations({ "en-US": "stop", ko: "종료" })
      .setDescription("Stop vote.")
      .setDescriptionLocalizations({
        "en-US": "Stop vote.",
        ko: "투표를 종료합니다.",
      })
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("search")
      .setNameLocalizations({ "en-US": "search", ko: "검색" })
      .setDescription("Search vote")
      .setDescriptionLocalizations({
        "en-US": "Search vote",
        ko: "투표를 검색합니다.",
      })
      .addStringOption((option) =>
        option
          .setName("seed")
          .setNameLocalizations({ "en-US": "seed", ko: "시드" })
          .setDescription("seed")
          .setDescriptionLocalizations({ "en-US": "seed", ko: "시드" })
          .setRequired(true)
      )
  );
/**
 *
 * @param {Discord.CommandInteraction} interaction
 * @returns
 */
async function execute(interaction) {
  const lang = util.setLang(interaction.locale);
  const quick = require("../util/quick");

  if (interaction.options.getSubcommand() === "start") {
    const topic = interaction.options.getString("topic");
    const description = interaction.options.getString("description");
    let over = interaction.options.getBoolean("overlap");

    if (!over) over = false;

    let votetime = util.readFile(require.resolve("../data/votetime.json"));
    let canvote = "";
    let votecooltime = 0;

    await checkCooltime(votetime, canvote, votecooltime, interaction);

    let term = interaction.options.getInteger("term");
    const defaultTerm = 12;
    if (term) {
      if (!interaction.member.roles.cache.some((role) => role.name === "MOD")) {
        if (term <= 0)
          return interaction.reply({
            ephemeral: true,
            content: lang.vote.alert.wrongterm,
          });
        if (term > 24)
          return interaction.reply({
            ephemeral: true,
            content: lang.vote.alert.wrongterm,
          });
      } else {
        if (term < 0)
          return interaction.reply({
            ephemeral: true,
            content: lang.vote.alert.wrongterm,
          });
        if (term > 24)
          return interaction.reply({
            ephemeral: true,
            content: lang.vote.alert.wrongterm,
          });
      }
    } else term = defaultTerm;

    let options = getOptions(interaction);

    let max;
    if (over) max = Object.values(options).length;
    else max = 1;

    let seed = getSeed();

    let VoteObject = new Vote({
      topic: topic,
      description: description,
      overlap: over,
      term: term,
      interaction: interaction,
      seed: seed,
      max: max,
      username: interaction.member.nickname || interaction.member.user.tag,
      lang: lang,
      channelname: interaction.channel.name,
      options: options,
    });
    VoteObject.sendVote();
    //
  } else if (interaction.options.getSubcommand() === "stop") {
    await interaction.deferReply({ ephemeral: true });
    if (!fs.existsSync(require.resolve("../data/vote.json")))
      fs.writeFileSync(
        require.resolve("../data/vote.json"),
        JSON.stringify({})
      );
    const dataRead = fs.readFileSync(
      require.resolve("../data/vote.json"),
      "utf8"
    );
    const voteData = JSON.parse(dataRead);

    var list = Object.values(voteData);

    if (!list[0]) {
      return interaction.editReply({
        ephemeral: true,
        content: lang.vote.alert.nostop,
      });
    }

    if (!interaction.member.roles.cache.some((role) => role.name === "MOD")) {
      function getVote() {
        let topics = [];
        for (let i = 0; i < list.length; i++) {
          topics.push({
            label: voteData[list[i]].topic,
            description: lang.vote.menu.description.replaceAll(
              "${label}",
              voteData[list[i]].options[0].label + ` | ${list[i].channelname}`
            ),
            value: voteData[list[i]].seed,
          });
        }
        if (topics.length < 1) return false;
        return topics;
      }

      if (getVote() == false)
        return interaction.editReply({
          ephemeral: true,
          content: lang.vote.alert.nostop,
        });

      const stopembed = new Discord.EmbedBuilder()
        .setDescription(lang.vote.embed.stop.description)
        .setColor("#2F3136");

      const stopmenu = new Discord.ActionRowBuilder().addComponents(
        new Discord.SelectMenuBuilder()
          .setCustomId("stopvote")
          .setPlaceholder(lang.vote.menu.stopPlaceholder)
          .addOptions(getVote())
          .setMaxValues(1)
      );
      await interaction.editReply({
        embeds: [stopembed],
        components: [stopmenu],
        ephemeral: true,
      });
    } else {
      async function getVoteModerator() {
        let topics = [];
        for (let i = 0; i < list.length; i++) {
          topics.push({
            label: list[i].topic,
            description: lang.vote.menu.stopDescription
              .replaceAll("${username}", list[i].username)
              .replaceAll(
                "${label}",
                list[i].options.option1 + ` | ${list[i].channelname}`
              ),
            value: list[i].seed,
          });
        }
        if (topics.length < 1) return false;
        return topics;
      }

      const stopEmbedModerator = new Discord.EmbedBuilder()
        .setDescription(lang.vote.embed.stop.description)
        .setColor("#2F3136");

      const stopMenuModerator = new Discord.ActionRowBuilder().addComponents(
        new Discord.SelectMenuBuilder()
          .setCustomId("stopvote")
          .setPlaceholder(lang.vote.menu.stopPlaceholder)
          .addOptions(await getVoteModerator())
          .setMaxValues(1)
      );
      await interaction.editReply({
        embeds: [stopEmbedModerator],
        components: [stopMenuModerator],
        ephemeral: true,
      });
    }
  } else if (interaction.options.getSubcommand() === "search") {
    if (
      !interaction.member.roles.cache.has("987045537645727766" /* MOD Only */)
    )
      return quick.sendPermissionErrorEmbed(interaction);

    let seed = interaction.options.getString("seed");

    let votejson = util.readFile(require.resolve("../data/vote.json"));
    let votes = Object.keys(votejson);
    let votefind = votes.find((e) => e.startsWith(seed.substring(0, 6)));
    if (votefind) seed = votefind;

    if (votejson[seed]) {
      const Embed = new Discord.EmbedBuilder()
        .setTitle(`${votejson[seed].topic} | ${seed.substring(0, 6)}`)
        .addFields(
          {
            name: "작성자",
            value: `<@${votejson[seed].interaction.user}>`,
            inline: true,
          },
          {
            name: votejson[seed].topic,
            value: votejson[seed].message.embeds[0].description,
          }
        )
        .setColor("#2F3136")
        .setURL(
          `https://discord.com/channels/${votejson[seed].message.guildId}/${votejson[seed].message.channelId}/${votejson[seed].message.id}`
        )
        .setFooter({ text: seed });
      let voted = votejson[seed].voted;
      if (voted) {
        let options = Object.values(votejson[seed].options);
        let message = "";
        for (let i = 0; i < options.length; i++) {
          let userMsg = "";
          let users = voted.filter((item) =>
            item.select.find((e) => e === `vote${i}`)
          );
          users.forEach((user) => {
            userMsg = userMsg + `<@${user.userid}>\n`;
          });
          message = userMsg + `*${users.length}표*\n`;
          if (message.length > 1024) {
            message.length = 1020;
            message = message + "...";
          }
          Embed.addFields({ name: options[i], value: message, inline: true });
        }
        Embed.addFields({
          name: "총 투표 수",
          value: votejson[seed].voted?.length + "표" || "없음",
        });
      }

      await interaction.reply({ ephemeral: true, embeds: [Embed] });
    } else
      return await interaction.reply({
        ephemeral: true,
        content: "잘못된 시드입니다.",
      });
  }
}

module.exports.excute = execute;

class Vote {
  /**
   * Create a new vote
   * @param {{topic: string, description: string, overlap: boolean, term: number, interaction: Discord.Interaction, seed: string, max: number, username: string, lang: any, channelname: string, endSchedule: scheduler.Job, message?: Discord.Message|object, stopmenu?: Discord.ActionRow|object, client?: Discord.Client, options: {option1: string, option2: string, option3: string, option4: string, option5: string, option6: string, option7: string, option8: string, option9: string, option10: string }}} param0
   */
  constructor({
    topic,
    description,
    overlap,
    term,
    interaction,
    seed,
    max,
    username,
    lang,
    channelname,
    message,
    stopmenu,
    client,
    options,
    endSchedule
  }) {
    this.topic = topic;
    this.description = description;
    this.overlap = overlap;
    this.term = term;
    this.interaction = interaction;
    this.seed = seed;
    this.max = max;
    this.username = username;
    this.channelname = channelname;
    this.endSchedule = endSchedule;
    if (this.endSchedule) this.setEndSchedule(this.endSchedule);
    else {
      let time = new Date()
      time.setHours(time.getHours() + this.term);
      this.endTime = time;
      this.setEndSchedule(time);
    }
    if (typeof lang === "string") this.lang = util.setLang(lang);
    else this.lang = lang;
    Object.keys(options).forEach((key) =>
      options[key] === undefined ? delete options[key] : {}
    );
    this.options = options;
    if (message) this.message = message;
    if (stopmenu) this.stopmenu = stopmenu;
    if (client) this.client = client;
  }

  toJSON() {
    let prop = {
      topic: this.topic,
      description: this.description,
      overlap: this.overlap,
      term: this.term,
      interaction: this.interaction.toJSON(),
      seed: this.seed,
      max: this.max,
      username: this.username,
      lang: this.lang.language,
      channelname: this.channelname,
      options: this.options,
      endTime: this.endTime.toString()
    };

    prop.interaction.appPermissions = `${prop.interaction.appPermissions}`;
    prop.interaction.memberPermissions = `${prop.interaction.memberPermissions}`;
    if (this.message) prop["message"] = this.message.toJSON();
    if (this.stopmenu) prop["stopmenu"] = this.stopmenu.toJSON();
    return prop;
  }


  /**
   *
   * @param {string} seed
   * @param {Discord.Snowflake} userid
   * @param {string | Array} select
   * @returns
   */
  async vote(userid, select) {
    if (!fs.existsSync(require.resolve("../data/vote.json")))
      fs.writeFileSync(
        require.resolve("../data/vote.json"),
        JSON.stringify({})
      );
    const dataRead = fs.readFileSync(
      require.resolve("../data/vote.json"),
      "utf8"
    );
    const voteData = JSON.parse(dataRead);
    let votedCheck = voteData[this.seed]["voted"];
    if (!votedCheck) voteData[this.seed]["voted"] = [];

    let voted = voteData[this.seed]["voted"];

    if (voted.find((item) => item.userid === userid)) {
      await this.cancelVote(userid, true).then(async (data) => {
        await data[this.seed]["voted"].push({
          userid: userid,
          select: select,
        });

        fs.writeFileSync(
          require.resolve("../data/vote.json"),
          JSON.stringify(data)
        );

        await this.refreshVote();
      });
      return false;
    }

    await voteData[this.seed]["voted"].push({
      userid: userid,
      select: select,
    });

    fs.writeFileSync(
      require.resolve("../data/vote.json"),
      JSON.stringify(voteData)
    );

    await this.refreshVote();

    return voteData[this.seed]["voted"];
  }

  /**
   *
   * @param {string} seed
   * @param {Discord.Snowflake} userid
   * @returns
   */
  async cancelVote(userid, falseRefresh) {
    if (!fs.existsSync(require.resolve("../data/vote.json")))
      fs.writeFileSync(
        require.resolve("../data/vote.json"),
        JSON.stringify({})
      );
    const dataRead = fs.readFileSync(
      require.resolve("../data/vote.json"),
      "utf8"
    );
    const voteData = JSON.parse(dataRead);
    let votedCheck = voteData[this.seed].voted;
    if (!votedCheck) return false;

    let voteResult = voteData[this.seed].voted.findIndex(
      (item) => item.userid === userid
    );
    if (voteResult < 0) return false;

    await voteData[this.seed].voted.splice(voteResult, 1);

    fs.writeFileSync(
      require.resolve("../data/vote.json"),
      JSON.stringify(voteData)
    );

    if (!falseRefresh) await this.refreshVote();

    return voteData;
  }

  async refreshVote() {
    if (!this.message) return;
    let channel;
    let message;

    if (this.client) {
      channel =
        this.client.channels.cache.get(this.interaction.channelId) ||
        this.interaction.channel;
      message = (await channel.messages.fetch(this.message.id)) || this.message;
    } else {
      channel = this.interaction.channel;
      message = this.message;
    }
    if (!fs.existsSync(require.resolve("../data/vote.json")))
      fs.writeFileSync(
        require.resolve("../data/vote.json"),
        JSON.stringify({})
      );
    const dataRead = fs.readFileSync(
      require.resolve("../data/vote.json"),
      "utf8"
    );
    const voteData = JSON.parse(dataRead);

    if (!voteData[this.seed]["voted"]) return false;

    let votedData = getVotedData(voteData[this.seed]["voted"]);
    let msgData = getVotedMsg(votedData, this);

    if (!msgData) {
      await message.edit("");
    } else {
      await message.edit(
        `${this.lang.interaction.menu.vote.alert.count} \n\`${msgData}\``
      );
    }
    fs.writeFileSync(
      require.resolve("../data/vote.json"),
      JSON.stringify(voteData)
    );

    return true;
  }

  /**
   * 투표를 보냅니다
   */
  sendVote() {
    if (this.interaction.isRepliable() === undefined)
      throw new Error("Invaild Interaction");
    const votemenu = new Discord.ActionRowBuilder().addComponents(
      new Discord.SelectMenuBuilder()
        .setCustomId(this.seed)
        .setPlaceholder(this.lang.vote.menu.placeholder)
        .addOptions(getVoteOption(this.options, this.lang))
        .setMaxValues(this.max)
        .setMinValues(0)
    );
    const votestopmenu = new Discord.ActionRowBuilder().addComponents(
      new Discord.SelectMenuBuilder()
        .setCustomId(this.seed)
        .setPlaceholder(this.lang.vote.menu.placeholder)
        .addOptions(getVoteOption(this.options, this.lang))
        .setMaxValues(this.max)
        .setMinValues(0)
        .setDisabled(true)
    );

    if (!fs.existsSync(require.resolve("../data/vote.json")))
      fs.writeFileSync(
        require.resolve("../data/vote.json"),
        JSON.stringify({})
      );
    const dataRead = fs.readFileSync(
      require.resolve("../data/vote.json"),
      "utf8"
    );
    const voteData = JSON.parse(dataRead);

    let Message = getMessage(this);
    let voteEmbed = Message.voteEmbed;

    if (this.interaction.replied === true) {
      this.interaction
        .editReply({
          embeds: [voteEmbed],
          components: [votemenu],
          fetchReply: true,
        })
        .then((message) => {
          message.pin();
          this.message = message;
          this.stopmenu = votestopmenu;
          voteData[this.seed] = this.toJSON();

          fs.writeFileSync(
            require.resolve("../data/vote.json"),
            JSON.stringify(voteData)
          );
        });
    } else {
      this.interaction
        .reply({
          embeds: [voteEmbed],
          components: [votemenu],
          fetchReply: true,
        })
        .then((message) => {
          message.pin();
          this.message = message;
          this.stopmenu = votestopmenu;
          voteData[this.seed] = this.toJSON();

          fs.writeFileSync(
            require.resolve("../data/vote.json"),
            JSON.stringify(voteData)
          );
        });
    }
  }

  /**
   * 투표를 종료합니다
   * @returns
   */
  async stopVote() {
    if (!this.message) return;
    let channel;
    /**
     * @type {Discord.Message}
     */
    let message;

    if (this.client) {
      channel =
        this.client.channels.cache.get(this.interaction.channelId) ||
        this.interaction.channel;
      message = (await channel.messages.fetch(this.message.id)) || this.message;
    } else {
      channel = this.interaction.channel;
      message = this.message;
    }

    if (!fs.existsSync(require.resolve("../data/vote.json")))
      fs.writeFileSync(
        require.resolve("../data/vote.json"),
        JSON.stringify({})
      );
    const dataRead = fs.readFileSync(
      require.resolve("../data/vote.json"),
      "utf8"
    );
    const voteData = JSON.parse(dataRead);

    if (!voteData[this.seed]["voted"])
      voteData[this.seed]["voted"] = [{ select: "None" }];
    let votedData = getVotedData(voteData[this.seed]["voted"]);
    let msgData = getVotedMsg(votedData, this, true);

    let votedArray = []
    let keys = Object.keys(votedData);
    let values = Object.values(votedData)
    for (let i = 0; i < keys.length; i++) {
      keys[i] = Object.values(this.options)[keys[i].split("vote")[1]];
      votedArray.push({ name: keys[i], value: values[i] })
    }
    votedArray.sort((a, b) => b.value - a.value)

    const editEmbed = new Discord.EmbedBuilder()
      .setTitle(
        this.lang.interaction.menu.vote.embed.votefin + " | " + this.topic
      )
      .setColor("Green")
    if (votedArray[0]?.name) editEmbed.addFields({ name: "1st", value: votedArray[0].name })
    if (votedArray[1]?.name) editEmbed.addFields({ name: "2nd", value: votedArray[1].name })
    if (votedArray[2]?.name) editEmbed.addFields({ name: "3rd", value: votedArray[2].name })

    editEmbed.addFields({ name: this.lang.interaction.menu.vote.embed.result, value: `\`\`\`js\n${msgData}\n\`\`\`` });

    await message.edit({
      content: this.lang.interaction.menu.vote.embed.votefinished,
      embeds: [editEmbed],
      components: [this.stopmenu],
    });

    await message.unpin();

    const newEditEmbed = new Discord.EmbedBuilder()
      .setTitle(
        this.lang.interaction.menu.vote.embed.votefin + " | " + this.topic
      )
      .setColor("#2F3136")
      .setDescription(
        this.lang.interaction.menu.vote.embed.votefinResult.replaceAll(
          "${msg.url}",
          message.url
        )
      );
    await channel.send({
      embeds: [newEditEmbed],
      content: this.lang.interaction.menu.vote.embed.votefinished,
    });

    delete voteData[this.seed];

    fs.writeFileSync(
      require.resolve("../data/vote.json"),
      JSON.stringify(voteData)
    );

    if (this.endSchedule !== "End") {
      this.endSchedule.cancel()
    }
  }

  async setEndSchedule(date) {
    this.endSchedule = scheduler.scheduleJob(date, async () => {
      this.endSchedule = "End"
      await this.stopVote();
    })
  }
}

function getSeed() {
  let cryptoData = Math.random();
  let hash = crypto.createHash("md5").update(`${cryptoData}`).digest("hex");
  return hash;
}

async function checkCooltime(votetime, canvote, votecooltime, interaction) {
  if (!interaction.member.roles.cache.some((role) => role.name === "MOD")) {
    for (let vote of votetime) {
      if (vote.user == interaction.member.user.id)
        if (Date.now() - vote.time < 30 * 60 * 1000) {
          canvote = "nocooltime";
          votecooltime = Date.now() - vote.time;
          break;
        }
    }
    let votedtime = 0;
    for (let voted of votetime) {
      if (voted.user == interaction.member.user.id) votedtime++;
    }
    if (votedtime > 2)
      return await interaction.reply({
        ephemeral: true,
        content: lang.vote.alert.max.replaceAll("${votedtime}", votedtime),
      });
    await votetime.push({
      user: interaction.member.user.id,
      time: Date.now(),
    });
    if (canvote == "nocooltime")
      return await interaction.reply({
        ephemeral: true,
        content: lang.vote.alert.cooltime.replaceAll(
          "${time}",
          Math.floor(votecooltime / 1000 / 60)
        ),
      });
    fs.writeFileSync("./data/votetime.json", JSON.stringify(votetime));
  }
}
/**
 *
 * @param {Discord.Interaction} interaction
 * @returns
 */
function getOptions(interaction) {
  let optionObject = {};
  let sel = [];
  const s1 = interaction.options.getString("option1");
  const s2 = interaction.options.getString("option2");
  const s3 = interaction.options.getString("option3");
  const s4 = interaction.options.getString("option4");
  const s5 = interaction.options.getString("option5");
  const s6 = interaction.options.getString("option6");
  const s7 = interaction.options.getString("option7");
  const s8 = interaction.options.getString("option8");
  const s9 = interaction.options.getString("option9");
  const s10 = interaction.options.getString("option10");
  sel.push(s1);
  sel.push(s2);
  if (s3) sel.push(s3);
  if (s4) sel.push(s4);
  if (s5) sel.push(s5);
  if (s6) sel.push(s6);
  if (s7) sel.push(s7);
  if (s8) sel.push(s8);
  if (s9) sel.push(s9);
  if (s10) sel.push(s10);

  sel = Array.from(new Set(sel)).filter((element) => {
    return element !== undefined;
  });

  optionObject["option1"] = sel[0];
  if (sel[1]) optionObject["option2"] = sel[1];
  if (sel[2]) optionObject["option3"] = sel[2];
  if (sel[3]) optionObject["option4"] = sel[3];
  if (sel[4]) optionObject["option5"] = sel[4];
  if (sel[5]) optionObject["option6"] = sel[5];
  if (sel[6]) optionObject["option7"] = sel[6];
  if (sel[7]) optionObject["option8"] = sel[7];
  if (sel[8]) optionObject["option9"] = sel[8];
  if (sel[9]) optionObject["option10"] = sel[9];

  return optionObject;
}

function getMessage(voteClass) {
  let selmsg = "";
  let option = Object.values(voteClass.options);

  for (let i = 0; i < option.length; i++) {
    if (option.length - 1 == i) {
      selmsg = selmsg + `${i + 1}. ${option[i]}`;
      var voteEmbed = new Discord.EmbedBuilder()
        .setTitle(
          voteClass.lang.vote.embed.title.replaceAll(
            "${topic}",
            voteClass.topic
          )
        )
        .setDescription(voteClass.description + "\n```md\n" + selmsg + "```")
        .setFooter({
          text:
            voteClass.lang.vote.embed.description
              .replaceAll("${over}", voteClass.overlap)
              .replaceAll("${term}", voteClass.term) +
            "      " +
            voteClass.seed,
        })
        .setColor("#2F3136");
    } else selmsg = selmsg + `${i + 1}. ${option[i]}\n`;
  }
  return { selmsg: selmsg, voteEmbed: voteEmbed };
}

function getVoteOption(options, lang) {
  let option = Object.values(options);
  var voteArray = [];
  for (let i = 0; i < option.length; i++) {
    voteArray.push({
      label: option[i],
      value: "vote" + i,
    });
  }
  voteArray.push({
    label: lang.vote.alert.cancelvotename,
    description: lang.vote.alert.cancelvotevalue,
    value: "cancelvote",
  });
  return voteArray;
}

function getVotedData(data) {
  if (!data[0]) return false;
  let selected = {};
  if (Array.isArray(data[0].select)) {
    for (let vote of data) {
      for (let voted of vote.select) {
        if (!selected[voted]) selected[voted] = 0;
        selected[voted] += 1;
      }
    }
  } else {
    for (let vote of data) {
      if (!selected[vote.select]) selected[vote.select] = 0;
      selected[vote.select] += 1;
    }
  }
  return selected;
}

function getVotedMsg(data, classData, stop) {
  let msg = "";
  if (data === false) return false;
  let keys = Object.keys(data);
  let values = Object.values(data);

  if (stop) {
    let stopOpt = Object.values(classData.options);
    let obj = {};

    {
      if (stopOpt[0] && data["vote0"]) obj[stopOpt[0]] = data["vote0"];
      else if (stopOpt[0]) obj[stopOpt[0]] = 0;
      if (stopOpt[1] && data["vote1"]) obj[stopOpt[1]] = data["vote1"];
      else if (stopOpt[1]) obj[stopOpt[1]] = 0;
      if (stopOpt[2] && data["vote2"]) obj[stopOpt[2]] = data["vote2"];
      else if (stopOpt[2]) obj[stopOpt[2]] = 0;
      if (stopOpt[3] && data["vote3"]) obj[stopOpt[3]] = data["vote3"];
      else if (stopOpt[3]) obj[stopOpt[3]] = 0;
      if (stopOpt[4] && data["vote4"]) obj[stopOpt[4]] = data["vote4"];
      else if (stopOpt[4]) obj[stopOpt[4]] = 0;
      if (stopOpt[5] && data["vote5"]) obj[stopOpt[5]] = data["vote5"];
      else if (stopOpt[5]) obj[stopOpt[5]] = 0;
      if (stopOpt[6] && data["vote6"]) obj[stopOpt[6]] = data["vote6"];
      else if (stopOpt[6]) obj[stopOpt[6]] = 0;
      if (stopOpt[7] && data["vote7"]) obj[stopOpt[7]] = data["vote7"];
      else if (stopOpt[7]) obj[stopOpt[7]] = 0;
      if (stopOpt[8] && data["vote8"]) obj[stopOpt[8]] = data["vote8"];
      else if (stopOpt[8]) obj[stopOpt[8]] = 0;
      if (stopOpt[9] && data["vote9"]) obj[stopOpt[9]] = data["vote9"];
      else if (stopOpt[9]) obj[stopOpt[9]] = 0;
    }

    for (let i = 0; i < Object.values(obj).length; i++) {
      let key = Object.keys(obj)[i];
      let value = Object.values(obj)[i];
      msg = msg + `${key}: ${value}표\n`;
    }
    return msg;
  }

  for (let i = 0; i < keys.length; i++) {
    keys[i] = Object.values(classData.options)[keys[i].split("vote")[1]];
    msg = msg + `${keys[i]}: ${values[i]}표\n`;
  }
  return msg;
}

module.exports = {
  data: data,
  execute: execute,
  vote: Vote,
  getSeed: getSeed,
};
