const { SlashCommandBuilder } = require("@discordjs/builders");
const quick = require("../util/quick.js");
const util = require("../util/util");

module.exports.data = new SlashCommandBuilder()
  .setName("투표")
  .setDescription("투표 기능입니다.")
  .addSubcommand((subcommand) =>
    subcommand
      .setName("시작")
      .setDescription("새로운 투표를 만듭니다.")
      .addStringOption((option) =>
        option.setName("주제").setDescription("주제").setRequired(true)
      )
      .addStringOption((option) =>
        option.setName("설명").setDescription("설명").setRequired(true)
      )
      .addStringOption((option) =>
        option.setName("선택지1").setDescription("선택지").setRequired(true)
      )
      .addStringOption((option) =>
        option.setName("선택지2").setDescription("선택지").setRequired(true)
      )
      .addIntegerOption((option) =>
        option
          .setName("기간")
          .setDescription("시간 단위입니다. | 기본값: 12시간")
          .setRequired(false)
      )
      .addBooleanOption((option) =>
        option
          .setName("중복여부")
          .setDescription("중복 투표 가능 여부 | 기본값: false")
          .setRequired(false)
      )

      .addStringOption((option) =>
        option.setName("선택지3").setDescription("선택지").setRequired(false)
      )
      .addStringOption((option) =>
        option.setName("선택지4").setDescription("선택지").setRequired(false)
      )
      .addStringOption((option) =>
        option.setName("선택지5").setDescription("선택지").setRequired(false)
      )
      .addStringOption((option) =>
        option.setName("선택지6").setDescription("선택지").setRequired(false)
      )
      .addStringOption((option) =>
        option.setName("선택지7").setDescription("선택지").setRequired(false)
      )
      .addStringOption((option) =>
        option.setName("선택지8").setDescription("선택지").setRequired(false)
      )
      .addStringOption((option) =>
        option.setName("선택지9").setDescription("선택지").setRequired(false)
      )
      .addStringOption((option) =>
        option.setName("선택지10").setDescription("선택지").setRequired(false)
      )
  )
  .addSubcommand((subcommand) =>
    subcommand.setName("종료").setDescription("투표를 종료합니다.")
  );

module.exports.execute = execute;

const Discord = require("discord.js");
const fs = require("fs");

var sel = [];
function addsel(value) {
  sel.push(value);
}

var crypto = require("crypto");

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
  sel = [];
  let voteList = quick.readFile("./data/vote.json");
  let votetime = quick.readFile("./data/votetime.json");
  let canvote = "";
  let votecooltime = 0;

  if (interaction.options.getSubcommand() === "시작") {
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
          content:
            "투표는 한번에 2번까지만 할 수 있어요. 다른 투표를 종료해주세요.\n" +
            "현재 투표 수: " +
            votedtime,
        });
      await votetime.push({
        user: interaction.member.user.id,
        time: Date.now(),
      });
      if (canvote == "nocooltime")
        return await interaction.reply({
          ephemeral: true,
          content:
            "아직 쿨타임이 지나지 않아 사용할 수 없어요.\n쿨타임: 30분\n지난 시간: " +
            Math.floor(votecooltime / 1000 / 60) +
            "분",
        });
      fs.writeFileSync("./data/votetime.json", JSON.stringify(votetime));
    }
    const topic = interaction.options.getString("주제");
    const description = interaction.options.getString("설명");
    const overs = interaction.options.getBoolean("중복여부");
    let over = "";
    if (overs) over = true;
    if (!overs) over = false;
    let term = interaction.options.getInteger("기간");
    if (term) {
      if (!interaction.member.roles.cache.some((role) => role.name === "MOD")) {
        if (term <= 0)
          return interaction.reply({
            ephemeral: true,
            content: "잘못된 기간이에요.\n1~24 사이의 숫자를 입력해 주세요.",
          });
        if (term > 24)
          return interaction.reply({
            ephemeral: true,
            content: "잘못된 기간이에요.\n1~24 사이의 숫자를 입력해 주세요.",
          });
      } else {
        if (term < 0)
          return interaction.reply({
            ephemeral: true,
            content: "잘못된 기간이에요.\n0~24 사이의 숫자를 입력해 주세요.",
          });
        if (term > 24)
          return interaction.reply({
            ephemeral: true,
            content: "잘못된 기간이에요.\n0~24 사이의 숫자를 입력해 주세요.",
          });
      }
    } else term = 12;
    const s1 = interaction.options.getString("선택지1");
    const s2 = interaction.options.getString("선택지2");
    const s3 = interaction.options.getString("선택지3");
    const s4 = interaction.options.getString("선택지4");
    const s5 = interaction.options.getString("선택지5");
    const s6 = interaction.options.getString("선택지6");
    const s7 = interaction.options.getString("선택지7");
    const s8 = interaction.options.getString("선택지8");
    const s9 = interaction.options.getString("선택지9");
    const s10 = interaction.options.getString("선택지10");
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
          .setTitle(`투표 | ${topic}`)
          .setDescription(description + "\n```md\n" + selmsg + "```")
          .setFooter({
            text: `중복 투표: ${over}` + " • " + `기간: ${term}시간`,
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
          let { stopvote } = require("../event/interaction.js");
          let nowDate = new Date();
          nowDate.setTime(nowDate.getHours() + term);
          util.schedule(
            nowDate,
            await stopvote(),
            seed,
            interaction.member.user.id
          );
        }
      });

    // 종료
  } else if (interaction.options.getSubcommand() === "종료") {
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
            description: `첫번째 선택지: ${vote[list[i]].options[0].label}`,
            value: vote[list[i]].seed,
          });
        }
        if (topics.length < 1) return false;
        return topics;
      }

      if ((await getVote()) == false)
        return interaction.reply({
          ephemeral: true,
          content: "종료할 수 있는 투표가 없어요.",
        });

      const stopembed = new Discord.EmbedBuilder()
        .setDescription("어떤 투표를 종료할까요?")
        .setColor("Blue");

      const stopmenu = new Discord.ActionRowBuilder().addComponents(
        new Discord.SelectMenuBuilder()
          .setCustomId("stopvote")
          .setPlaceholder("지울 투표를 선택하세요!")
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
            description:
              `작성자: ${vote[i].username}, ` +
              `첫번째 선택지: ${vote[i].options[0].label}`,
            value: vote[i].seed,
          });
        }
        if (topics.length < 1) return false;
        return topics;
      }

      if ((await getVoteModerator()) == false)
        return interaction.reply({
          ephemeral: true,
          content: "종료할 수 있는 투표가 없어요.",
        });

      const stopEmbedModerator = new Discord.EmbedBuilder()
        .setDescription("어떤 투표를 종료할까요?")
        .setColor("Blue");

      const stopMenuModerator = new Discord.ActionRowBuilder().addComponents(
        new Discord.SelectMenuBuilder()
          .setCustomId("stopvote")
          .setPlaceholder("지울 투표를 선택하세요!")
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
        let { stopvote } = require("../menu.js");
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
