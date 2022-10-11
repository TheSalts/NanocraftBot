const { SlashCommandBuilder } = require("@discordjs/builders");
const quick = require("../util/quick.js");
const util = require("../util/util");

module.exports.data = new SlashCommandBuilder()
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
  );

module.exports.execute = execute;

const Discord = require("discord.js");
const fs = require("fs");

var sel = [];
function addsel(value) {
  sel.push(value);
}

var crypto = require("crypto");
const path = require("path");

function getSeed() {
  let cryptoData = Math.random();
  var hash = crypto.createHash("md5").update(`${cryptoData}`).digest("hex");
  return hash;
}

function getVoteOption() {
  var voteArray = [];
  for (let i = 0; i < sel.length; i++) {
    voteArray.push({
      label: sel[i],
      value: "vote" + i,
    });
  }
  voteArray.push({
    label: "투표 취소",
    description: "투표를 취소합니다",
    value: "cancelvote",
  });
  return voteArray;
}

async function execute(interaction) {
  const lang = util.setLang(interaction.locale);
  sel = [];
  let voteList = quick.readFile(path.resolve("./data/vote.json"));
  let votetime = quick.readFile(path.resolve("./data/votetime.json"));
  let canvote = "";
  let votecooltime = 0;

  if (interaction.options.getSubcommand() === "start") {
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
    const topic = interaction.options.getString("topic");
    const description = interaction.options.getString("description");
    const overs = interaction.options.getBoolean("overlap");
    let over = "";
    if (overs) over = true;
    if (!overs) over = false;
    let term = interaction.options.getInteger("term");
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
    } else term = 12;
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
    addsel(s1);
    addsel(s2);
    if (s3) addsel(s3);
    if (s4) addsel(s4);
    if (s5) addsel(s5);
    if (s6) addsel(s6);
    if (s7) addsel(s7);
    if (s8) addsel(s8);
    if (s9) addsel(s9);
    if (s10) addsel(s10);

    sel = Array.from(new Set(sel));

    var selmsg = "";
    for (let i = 0; i < sel.length; i++) {
      if (sel.length - 1 == i) {
        selmsg = selmsg + `${i + 1}. ${sel[i]}`;
        var voteEmbed = new Discord.EmbedBuilder()
          .setTitle(lang.vote.embed.title.replaceAll("${topic}", topic))
          .setDescription(description + "\n```md\n" + selmsg + "```")
          .setFooter({
            text: lang.vote.embed.description
              .replaceAll("${over}", over)
              .replaceAll("${term}", term),
          });
      } else selmsg = selmsg + `${i + 1}. ${sel[i]}\n`;
    }

    let seed = getSeed();

    var max = 1;
    if (over) max = sel.length;
    else max = 1;

    const votemenu = new Discord.ActionRowBuilder().addComponents(
      new Discord.SelectMenuBuilder()
        .setCustomId(seed.toString())
        .setPlaceholder(lang.vote.menu.placeholder)
        .addOptions(getVoteOption())
        .setMaxValues(max)
        .setMinValues(0)
    );
    const votestopmenu = new Discord.ActionRowBuilder().addComponents(
      new Discord.SelectMenuBuilder()
        .setCustomId(seed.toString())
        .setPlaceholder(lang.vote.menu.placeholder)
        .addOptions(getVoteOption())
        .setMaxValues(max)
        .setMinValues(0)
        .setDisabled(true)
    );

    interaction
      .reply({
        embeds: [voteEmbed],
        components: [votemenu],
        ephemeral: false,
        fetchReply: true,
      })
      .then(async (message) => {
        message.pin();
        await voteList.push({
          user: interaction.member.user.id,
          username: interaction.member.user.username,
          seed: seed.toString(),
          message: message.id,
          options: getVoteOption(),
          topic: topic,
          channel: interaction.channel.id,
          menu: votestopmenu,
        });

        fs.writeFileSync("./data/vote.json", JSON.stringify(voteList));

        let voted = quick.readFile("./data/voteResult.json");
        let votelist = [];
        for (let i = 0; i < sel.length; i++) {
          votelist.push({ name: sel[i], value: 0 });
        }

        voted.push({ seed: seed.toString(), voted: votelist });

        fs.writeFileSync("./data/voteResult.json", JSON.stringify(voted));
        if (term != 0) {
          let { stopvote } = require("../module/interaction.js");
          let nowDate = new Date();
          nowDate.setTime(nowDate.getHours() + term);
          util.schedule(
            nowDate,
            await stopvote(message.channel, seed),
            seed,
            interaction.member.user.id
          );
        }
      });

    // 종료
  } else if (interaction.options.getSubcommand() === "stop") {
    let vote = quick.readFile("./data/vote.json");

    if (!interaction.member.roles.cache.some((role) => role.name === "MOD")) {
      var list = [];
      for (let i = 0; i < vote.length; i++) {
        if (vote[i].user == interaction.member.user.id) {
          list.push(i);
        }
      }

      async function getVote() {
        let topics = [];
        for (let i = 0; i < list.length; i++) {
          topics.push({
            label: vote[list[i]].topic,
            description: lang.vote.menu.description.replaceAll(
              "${label}",
              vote[list[i]].options[0].label
            ),
            value: vote[list[i]].seed,
          });
        }
        if (topics.length < 1) return false;
        return topics;
      }

      if ((await getVote()) == false)
        return interaction.reply({
          ephemeral: true,
          content: lang.vote.alert.nostop,
        });

      const stopembed = new Discord.EmbedBuilder()
        .setDescription(lang.vote.embed.stop.description)
        .setColor("Blue");

      const stopmenu = new Discord.ActionRowBuilder().addComponents(
        new Discord.SelectMenuBuilder()
          .setCustomId("stopvote")
          .setPlaceholder(lang.vote.menu.stopPlaceholder)
          .addOptions(await getVote())
          .setMaxValues(1)
      );
      await interaction.reply({
        embeds: [stopembed],
        components: [stopmenu],
        ephemeral: true,
      });
    } else {
      async function getVoteModerator() {
        let topics = [];
        for (let i = 0; i < vote.length; i++) {
          topics.push({
            label: vote[i].topic,
            description: lang.vote.menu.stopDescription
              .replaceAll("${username}", vote[i].username)
              .replaceAll("${label}", vote[i].options[0].label),
            value: vote[i].seed,
          });
        }
        if (topics.length < 1) return false;
        return topics;
      }

      if ((await getVoteModerator()) == false)
        return interaction.reply({
          ephemeral: true,
          content: lang.vote.alert.nostop,
        });

      const stopEmbedModerator = new Discord.EmbedBuilder()
        .setDescription(lang.vote.embed.stop.description)
        .setColor("Blue");

      const stopMenuModerator = new Discord.ActionRowBuilder().addComponents(
        new Discord.SelectMenuBuilder()
          .setCustomId("stopvote")
          .setPlaceholder(lang.vote.menu.stopPlaceholder)
          .addOptions(await getVoteModerator())
          .setMaxValues(1)
      );
      await interaction.reply({
        embeds: [stopEmbedModerator],
        components: [stopMenuModerator],
        ephemeral: true,
      });
    }
  }
}

module.exports.vote = async function (user, channel, voteuserid, voteusername) {
  let voteList = quick.readFile("./data/vote.json");

  sel = [];
  const topic = `${user.username}님의 멤버 신청`;
  const description = `${user.username}님의 멤버 신청 찬반 투표입니다`;
  let term = 12;
  addsel("찬성");
  addsel("반대");

  sel = Array.from(new Set(sel));

  var selmsg = "";
  for (let i = 0; i < sel.length; i++) {
    if (sel.length - 1 == i) {
      selmsg = selmsg + `${i + 1}. ${sel[i]}`;
      var voteEmbed = new Discord.EmbedBuilder()
        .setTitle(`투표 | ${topic}`)
        .setDescription(description + "\n```md\n" + selmsg + "```")
        .setFooter({
          text: `중복 투표: false` + " • " + `기간: ${term}시간`,
        });
    } else selmsg = selmsg + `${i + 1}. ${sel[i]}\n`;
  }

  let seed = getSeed();
  let max = 1;

  const votemenu = new Discord.ActionRowBuilder().addComponents(
    new Discord.SelectMenuBuilder()
      .setCustomId(seed.toString())
      .setPlaceholder("투표할 항목을 선택하세요!")
      .addOptions(getVoteOption())
      .setMaxValues(max)
      .setMinValues(0)
  );
  const votestopmenu = new Discord.ActionRowBuilder().addComponents(
    new Discord.SelectMenuBuilder()
      .setCustomId(seed.toString())
      .setPlaceholder("투표할 항목을 선택하세요!")
      .addOptions(getVoteOption())
      .setMaxValues(max)
      .setMinValues(0)
      .setDisabled(true)
  );

  channel
    .send({
      embeds: [voteEmbed],
      components: [votemenu],
    })
    .then(async (message) => {
      message.pin();
      await voteList.push({
        user: voteuserid,
        username: voteusername,
        seed: seed.toString(),
        message: message.id,
        options: getVoteOption(),
        topic: topic,
        channel: channel.id,
        menu: votestopmenu,
      });

      fs.writeFileSync("./data/vote.json", JSON.stringify(voteList));

      let voted = quick.readFile("./data/voteResult.json");
      let votelist = [];
      for (let i = 0; i < sel.length; i++) {
        votelist.push({ name: sel[i], value: 0 });
      }

      voted.push({ seed: seed.toString(), voted: votelist });

      fs.writeFileSync("./data/voteResult.json", JSON.stringify(voted));
      if (term != 0) {
        let { stopvote } = require("../module/interaction.js");
        let nowDate = new Date();
        nowDate.setTile(nowDate.getHours() + term);
        util.schedule(
          nowDate,
          await stopvote(),
          seed,
          interaction.member.user.id
        );
      }
    });
};
