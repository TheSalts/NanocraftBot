require("dotenv").config();
const Discord = require("discord.js");
const config = require("../config.json");
const {
  Client,
  GatewayIntentBits,
  Partials,
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  PermissionsBitField,
  EmbedBuilder,
} = require("discord.js");
const { vote } = require("../commands/vote");
const fetch = require("node-fetch");
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [
    Partials.Channel,
    Partials.Message,
    Partials.User,
    Partials.GuildMember,
    Partials.Reaction,
  ],
});
const fs = require("fs");
const util = require("../util/util");
const path = require("path");
const notion = require("@notionhq/client");
const quick = require("../util/quick");

client.login(config.token);

client.once("ready", () => {
  console.log("interaction ready");
});

client.on("interactionCreate", async (interaction) => {
  if (interaction.isAutocomplete()) await autocomplete(interaction);
  else if (interaction.isSelectMenu()) await selectMenu(interaction);
  else if (interaction.isButton()) await button(interaction);
  else if (interaction.isModalSubmit()) await modal(interaction);
});
/**
 * @type async function
 * @description Discord Select Menu Interaction
 * @param {Discord.SelectMenuInteraction} interaction
 */
async function selectMenu(interaction) {
  const lang = util.setLang(interaction.locale);
  if (!fs.existsSync(require.resolve("../data/vote.json")))
    fs.writeFileSync(require.resolve("../data/vote.json"), JSON.stringify({}));
  const dataRead = fs.readFileSync(
    require.resolve("../data/vote.json"),
    "utf8"
  );
  const votedata = JSON.parse(dataRead);

  let id = interaction.customId;
  switch (id) {
    case "stopvote":
      await stopvote(interaction.values[0]);
      break;
    case "searchResult":
      await searchresult();
      break;
    default:
      if (votedata[id]) {
        await voting(id);
        break;
      }
      await quick.sendErrorEmbed(
        interaction,
        lang.interaction.error.wrongInteraction
      );

      break;
  }

  async function voting(seed) {
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
    const data = voteData[seed];
    if (!data) {
      return false;
    }
    data["client"] = client;

    let VoteObject = new vote(data);
    let select = interaction.values;

    if (select.find((item) => item === "cancelvote")) {
      await VoteObject.cancelVote(interaction.member.user.id);
      return await interaction.reply({
        ephemeral: true,
        content: lang.interaction.menu.vote.alert.cancel,
      });
    }
    await VoteObject.vote(interaction.member.user.id, select);

    await interaction.reply({
      ephemeral: true,
      content: lang.interaction.menu.vote.alert.success,
    });
  }

  async function searchresult() {
    await interaction.deferReply({ ephemeral: true });
    let search = util.readFile(path.resolve("../data/search.json"));
    for (let i = 0; i < search.length; i++) {
      for (let j = 0; j < search[i].length; j++) {
        if (
          search[i][search[i].length - 1].seed ==
          interaction.values[0].substring(0, 6)
        ) {
          if (j == interaction.values[0].substring(6, 7)) {
            let embed = search[i][j];
            await interaction.channel.send({
              ephemeral: false,
              embeds: [embed],
            });
            // const linkPreviewGenerator = require("link-preview-generator");
            // const previewData = await linkPreviewGenerator(embed.url);
            // if (!previewData.img) {
            //   await interaction.channel.send({
            //     ephemeral: false,
            //     embeds: [embed],
            //   });
            // } else {
            //   let Embed = new Discord.EmbedBuilder()
            //     .setTitle(embed.title)
            //     .setColor("Blue")
            //     .setDescription(embed.description)
            //     .setFooter({ text: embed.footer.text })
            //     .setURL(embed.url)
            //     .setTimestamp(embed.timestamp);
            //   if (previewData.img) Embed.setThumbnail(previewData.img);
            //   await interaction.channel.send({
            //     ephemeral: false,
            //     embeds: [Embed],
            //   });
            // }
            const row = new Discord.ActionRowBuilder().addComponents(
              new Discord.SelectMenuBuilder()
                .setCustomId("nope")
                .setPlaceholder(lang.interaction.menu.search.sharecomplete)
                .addOptions({
                  label: lang.interaction.menu.search.label,
                  value: "nope",
                })
                .setDisabled(false)
            );
            await interaction.channel
              .fetch(search[i][search[i].length - 1].message)
              .then(async (msg) => {
                await msg.edit({ components: [row] });
              });
          }
        }
      }
    }
    await interaction.editReply({
      ephemeral: true,
      content: lang.interaction.menu.search.shared,
    });
  }
}
/**
 * @type async function
 * @description Discord Button Interaction
 * @param {Discord.ButtonInteraction} interaction
 */
async function button(interaction) {
  const lang = util.setLang(interaction.locale);
  switch (interaction.customId) {
    case "badalert":
      if (!interaction.member.roles.cache.some((role) => role.name === "MOD"))
        return;
      let embed = new Discord.EmbedBuilder()
        .setAuthor({
          name: interaction.message.embeds[0].author.name,
          iconURL: interaction.message.author.iconURL,
        })
        .setColor("#66FF66")
        .setTitle("제재 취소됨")
        .addFields(
          {
            name: interaction.message.embeds[0].fields[0].name,
            value: interaction.message.embeds[0].fields[0].value,
            inline: true,
          },
          {
            name: interaction.message.embeds[0].fields[1].name,
            value: interaction.message.embeds[0].fields[1].value,
            inline: false,
          }
        );

      let read = fs.readFileSync("../data/badalert.json", "utf8");
      let readjson = JSON.parse(read);

      for (
        let i = 0;
        i < interaction.message.embeds[0].fields[2].value * 1;
        i++
      ) {
        let index = readjson.indexOf(
          interaction.message.embeds[0].fields[4].value
        );
        if (index > -1) {
          readjson.splice(index, 1);
        }
      }
      fs.writeFileSync("../data/badalert.json", JSON.stringify(readjson));
      await interaction.message.edit({ embeds: [embed], components: [] });

      break;
    case "bugReport":
      const bugReportModal = new ModalBuilder()
        .setCustomId("bugReport")
        .setTitle(lang.interaction.button.bugreport.title);
      const bugfeature = new TextInputBuilder()
        .setCustomId("bugfeature")
        .setLabel(lang.interaction.button.bugreport.feature)
        .setPlaceholder(lang.interaction.button.bugreport.placeholder.bugreport)
        .setStyle(TextInputStyle.Short);
      const howtobug = new TextInputBuilder()
        .setCustomId("howtobug")
        .setLabel(lang.interaction.button.bugreport.how)
        .setStyle(TextInputStyle.Paragraph);
      const bugDescription = new TextInputBuilder()
        .setCustomId("bugDescription")
        .setLabel(lang.interaction.button.bugreport.description)
        .setStyle(TextInputStyle.Paragraph);
      const bugrow1 = new ActionRowBuilder().addComponents(bugfeature);
      const bugrow2 = new ActionRowBuilder().addComponents(howtobug);
      const bugrow3 = new ActionRowBuilder().addComponents(bugDescription);
      bugReportModal.addComponents(bugrow1, bugrow2, bugrow3);
      await interaction.showModal(bugReportModal);
      break;
    case "report":
      const reportModal = new ModalBuilder()
        .setCustomId("report")
        .setTitle(lang.interaction.button.reportuser.title);
      const reportUser = new TextInputBuilder()
        .setCustomId("reportUser")
        .setLabel(lang.interaction.button.reportuser.user)
        .setPlaceholder(lang.interaction.button.reportuser.placeholder.user)
        .setStyle(TextInputStyle.Short);
      const reportReason = new TextInputBuilder()
        .setCustomId("reportReason")
        .setLabel(lang.interaction.button.reportuser.reason)
        .setStyle(TextInputStyle.Paragraph);
      const reportrow1 = new ActionRowBuilder().addComponents(reportUser);
      const reportrow2 = new ActionRowBuilder().addComponents(reportReason);
      reportModal.addComponents(reportrow1, reportrow2);
      await interaction.showModal(reportModal);
      break;
    case "upServer":
      const upServerModal = new ModalBuilder()
        .setCustomId("upServer")
        .setTitle(lang.interaction.button.newfeature.title);
      const howUp = new TextInputBuilder()
        .setCustomId("howUp")
        .setLabel(lang.interaction.button.newfeature.where)
        .setPlaceholder(lang.interaction.button.newfeature.placeholder.where)
        .setStyle(TextInputStyle.Short);
      const upDescription = new TextInputBuilder()
        .setCustomId("upDescription")
        .setLabel(lang.interaction.button.newfeature.description)
        .setStyle(TextInputStyle.Paragraph);
      const whyUp = new TextInputBuilder()
        .setCustomId("whyUp")
        .setLabel(lang.interaction.button.newfeature.reason)
        .setStyle(TextInputStyle.Paragraph);
      const uprow1 = new ActionRowBuilder().addComponents(howUp);
      const uprow2 = new ActionRowBuilder().addComponents(upDescription);
      const uprow3 = new ActionRowBuilder().addComponents(whyUp);
      upServerModal.addComponents(uprow1, uprow2, uprow3);

      await interaction.showModal(upServerModal);
      break;
    case "qnaServer":
      const qnaServerModal = new ModalBuilder()
        .setCustomId("qnaServer")
        .setTitle(lang.interaction.button.question.title);
      const howqna = new TextInputBuilder()
        .setCustomId("howqna")
        .setLabel(lang.interaction.button.question.where)
        .setPlaceholder(lang.interaction.button.question.placeholder.where)
        .setStyle(TextInputStyle.Short);
      const qnaDescription = new TextInputBuilder()
        .setCustomId("qnaDescription")
        .setLabel(lang.interaction.button.question.description)
        .setStyle(TextInputStyle.Paragraph);
      const qnarow1 = new ActionRowBuilder().addComponents(howqna);
      const qnarow2 = new ActionRowBuilder().addComponents(qnaDescription);
      qnaServerModal.addComponents(qnarow1, qnarow2);
      await interaction.showModal(qnaServerModal);
      break;
    case "memberAdd":
      const memberAddModal = new ModalBuilder()
        .setCustomId("memberAdd")
        .setTitle(lang.interaction.button.nanocraft.title);
      const whatmade = new TextInputBuilder()
        .setCustomId("whatmade")
        .setLabel(lang.interaction.button.nanocraft.made)
        .setRequired(false)
        .setPlaceholder(lang.interaction.button.nanocraft.placeholder.made)
        .setStyle(TextInputStyle.Paragraph);
      const whoisme = new TextInputBuilder()
        .setCustomId("whoisme")
        .setLabel(lang.interaction.button.nanocraft.me)
        .setStyle(TextInputStyle.Paragraph);
      const howtechnical = new TextInputBuilder()
        .setCustomId("howtechnical")
        .setLabel(lang.interaction.button.nanocraft.tech)
        .setRequired(false)
        .setPlaceholder(lang.interaction.button.nanocraft.placeholder.tech)
        .setStyle(TextInputStyle.Paragraph);
      const goal = new TextInputBuilder()
        .setCustomId("goal")
        .setLabel(lang.interaction.button.nanocraft.goal)
        .setPlaceholder(lang.interaction.button.nanocraft.placeholder.goal)
        .setStyle(TextInputStyle.Paragraph);
      const mikeage = new TextInputBuilder()
        .setCustomId("mikeage")
        .setLabel(lang.interaction.button.nanocraft.mikeage)
        .setPlaceholder(lang.interaction.button.nanocraft.placeholder.mikeage)
        .setStyle(TextInputStyle.Short);

      const memberAddrow1 = new ActionRowBuilder().addComponents(whatmade);
      const memberAddrow2 = new ActionRowBuilder().addComponents(whoisme);
      const memberAddrow3 = new ActionRowBuilder().addComponents(howtechnical);
      const memberAddrow4 = new ActionRowBuilder().addComponents(goal);
      const memberAddrow5 = new ActionRowBuilder().addComponents(mikeage);
      memberAddModal.addComponents(
        memberAddrow1,
        memberAddrow2,
        memberAddrow3,
        memberAddrow4,
        memberAddrow5
      );
      await interaction.showModal(memberAddModal);
      break;
    case "other":
      const otherModal = new ModalBuilder()
        .setCustomId("other")
        .setTitle(lang.interaction.button.etc.title);
      const otherDescription = new TextInputBuilder()
        .setCustomId("otherDescription")
        .setLabel(lang.interaction.button.etc.description)
        .setStyle(TextInputStyle.Paragraph);
      const otherrow1 = new ActionRowBuilder().addComponents(otherDescription);
      otherModal.addComponents(otherrow1);
      await interaction.showModal(otherModal);
      break;
    case "publicTicket":
      let publicCategory = util.readFile(
        path.resolve("../data/publicCategory.json")
      );

      function getPublicCategory() {
        let categoryCheck = undefined;
        for (let i = 0; i < publicCategory.length; i++) {
          if (publicCategory[i].guildId === interaction.guildId) {
            categoryCheck = publicCategory[i];
          }
        }
        return categoryCheck;
      }

      function getCategory() {
        let category = undefined;
        for (let properties of publicCategory) {
          if (properties.guildId === interaction.guildId) {
            category = properties.category;
            break;
          }
        }
        if (!category) return undefined;
        else return category;
      }

      let category = getCategory();
      if (!category)
        category = interaction.guild.channels.cache.find(
          (channelCategory) => channelCategory.name === "퍼블릭 서버"
        );

      const row = new Discord.ActionRowBuilder().addComponents(
        new Discord.ButtonBuilder()
          .setCustomId("closePublicChannel")
          .setLabel("문의 닫기")
          .setStyle(Discord.ButtonStyle.Secondary),
        new Discord.ButtonBuilder()
          .setCustomId("deletePublicChannel")
          .setLabel("문의 삭제")
          .setStyle(Discord.ButtonStyle.Danger)
      );
      let channel = await interaction.guild.channels.create({
        name: "channel-" + getPublicCategory().number,
        type: Discord.ChannelType.GuildText,
        parent: category.id,
        permissionOverwrites: [
          {
            id: interaction.guild.roles.everyone,
            deny: [PermissionsBitField.Flags.ViewChannel],
          },
          {
            id: interaction.member.user.id,
            allow: [
              PermissionsBitField.Flags.ViewChannel,
              PermissionsBitField.Flags.SendMessages,
            ],
          },
        ],
      });

      let nanocraftGuild = client.guilds.cache.get("987045537595420752");
      let nanocraft = await nanocraftGuild.channels.create({
        name: "channel-" + getPublicCategory().number,
        type: Discord.ChannelType.GuildText,
        parent: "1009483797714174153",
        permissionOverwrites: [
          {
            id: nanocraftGuild.roles.everyone,
            deny: [PermissionsBitField.Flags.ViewChannel],
          },
        ],
      });

      const ChannelEmbed = new Discord.EmbedBuilder()
        .setDescription(
          "퍼블릭 서버 문의에 오신 걸 환영해요!\n이 채널의 메시지는 Nanocraft SMP 서버와 연동되어 해당 관리자에게 문의할 수 있어요."
        )
        .setColor("Green")
        .addFields({ name: "연결 서버", value: nanocraftGuild.name });
      const nanocraftEmbed = new Discord.EmbedBuilder()
        .setDescription(
          "퍼블릭 서버 문의에 오신 걸 환영해요!\n이 채널의 메시지는 Nanocraft SMP 서버와 연동되어 해당 관리자에게 문의할 수 있어요."
        )
        .setColor("Green")
        .addFields({ name: "연결 서버", value: interaction.guild.name });

      await channel.send({
        embeds: [ChannelEmbed],
        components: [row],
        content: `<@${interaction.member.user.id}>`,
      });

      await nanocraft.send({
        embeds: [nanocraftEmbed],
        components: [row],
        content: `@${interaction.member.user.tag}`,
      });

      getPublicCategory().number++;

      let publicChannel = util.readFile(
        path.resolve("../data/publicChannel.json")
      );

      publicChannel.push({
        public: channel,
        nanocraft: nanocraft,
        user: interaction.member.user,
      });

      fs.writeFileSync(
        "../data/publicChannel.json",
        JSON.stringify(publicChannel)
      );
      fs.writeFileSync(
        "../data/publicCategory.json",
        JSON.stringify(publicCategory)
      );

      await interaction.reply({
        ephemeral: true,
        content: `문의 채널이 <#${channel.id}>에 생성되었어요.`,
      });
      break;
    case "closePublicChannel":
      let closepublicChannels = util.readFile(
        path.resolve("../data/publicChannel.json")
      );
      let getClosePublicChannels = getPropFromChannelRead(
        closepublicChannels,
        interaction.channelId
      );
      const closePublicChannelrow =
        new Discord.ActionRowBuilder().addComponents(
          new Discord.ButtonBuilder()
            .setCustomId("openPublicChannel")
            .setLabel("문의 열기")
            .setStyle(Discord.ButtonStyle.Success),
          new Discord.ButtonBuilder()
            .setCustomId("deletePublicChannel")
            .setLabel("문의 삭제")
            .setStyle(Discord.ButtonStyle.Danger)
        );
      await interaction.channel.permissionOverwrites.edit(
        getClosePublicChannels.user.id,
        {
          SendMessages: false,
        }
      );

      await client.channels.cache.get(getClosePublicChannels.public.id).send({
        content: `문의가 <@${interaction.member.user.id}>님에 의해 닫혔어요.`,
        components: [closePublicChannelrow],
      });
      await client.channels.cache
        .get(getClosePublicChannels.nanocraft.id)
        .send({
          content: `문의가 @${interaction.member.user.tag}님에 의해 닫혔어요.`,
          components: [closePublicChannelrow],
        });
      await interaction.reply({
        content: "문의를 성공적으로 닫았어요.",
        ephemeral: true,
      });
      break;
    case "openPublicChannel":
      let openpublicChannels = util.readFile(
        path.resolve("../data/publicChannel.json")
      );
      let getOpenPublicChannels = getPropFromChannelRead(
        openpublicChannels,
        interaction.channelId
      );
      await interaction.channel.permissionOverwrites.edit(
        getOpenPublicChannels.user.id,
        {
          SendMessages: true,
        }
      );
      await client.channels.cache.get(getOpenPublicChannels.public.id).send({
        content: `문의가 <@${interaction.member.user.id}>님에 의해 다시 열렸어요.`,
      });
      await client.channels.cache.get(getOpenPublicChannels.nanocraft.id).send({
        content: `문의가 @${interaction.member.user.tag}님에 의해 다시 열렸어요.`,
      });
      await interaction.reply({
        content: "문의가 성공적으로 열렸어요.",
        ephemeral: true,
      });
      break;
    case "deletePublicChannel":
      let publicChannels = util.readFile(
        path.resolve("../data/publicChannel.json")
      );

      let deleteId = [];
      for (let i = 0; i < publicChannels.length; i++) {
        switch (interaction.channelId) {
          case publicChannels[i].public.id:
            deleteId = [
              publicChannels[i].public.id,
              publicChannels[i].nanocraft.id,
            ];
            publicChannels.splice(i, 1);
            fs.writeFileSync(
              "../data/publicChannel.json",
              JSON.stringify(publicChannels)
            );
            break;
          case publicChannels[i].nanocraft.id:
            deleteId = [
              publicChannels[i].public.id,
              publicChannels[i].nanocraft.id,
            ];
            publicChannels.splice(i, 1);
            fs.writeFileSync(
              "../data/publicChannel.json",
              JSON.stringify(publicChannels)
            );
            break;
        }
      }

      await client.channels.cache.get(deleteId[0]).delete();
      await client.channels.cache.get(deleteId[1]).delete();
      break;
    case "deleteAPIstatus":
      let APIchannel = client.channels.cache.get("1020706773549715607");
      try {
        await APIchannel.bulkDelete(100).then();
      } catch (e) {
        if (e.name === "DiscordAPIError[50034]") {
          let APIEmbeds = new Discord.EmbedBuilder()
            .setTitle("메시지 삭제 실패")
            .setColor("Red")
            .setDescription(`2주일이 지난 메시지는 삭제할 수 없어요.`);
          return await APIchannel.send({
            ephemeral: true,
            embeds: [APIEmbeds],
          });
        }
      }
      const APIstatusEmbed = new Discord.EmbedBuilder().setTitle(
        "API status check"
      );
      const APIrow = new Discord.ActionRowBuilder().addComponents(
        new Discord.ButtonBuilder()
          .setCustomId("checkAPIstatus")
          .setLabel("API status")
          .setStyle(Discord.ButtonStyle.Success),
        new Discord.ButtonBuilder()
          .setCustomId("deleteAPIstatus")
          .setLabel("delete API status")
          .setStyle(Discord.ButtonStyle.Danger)
      );
      APIchannel.send({ embeds: [APIstatusEmbed], components: [APIrow] });
      break;
    case "notionSync":
      const notionSyncModal = new ModalBuilder()
        .setCustomId("notionSync")
        .setTitle("노션 페이지 설정");
      const notionSyncTitle = new TextInputBuilder()
        .setCustomId("notionSyncTitle")
        .setLabel("제목")
        .setValue(interaction.channel.name)
        .setRequired(false)
        .setStyle(TextInputStyle.Short);
      const notionSyncWorkState = new TextInputBuilder()
        .setCustomId("notionSyncWorkState")
        .setLabel("작업 상태")
        .setValue("진행 전 | 진행 중 | 진행 완료 | To Do")
        .setPlaceholder("진행 전 | 진행 중 | 진행 완료 | To Do")
        .setStyle(TextInputStyle.Short);
      const notionSyncPageType = new TextInputBuilder()
        .setCustomId("notionSyncPageType")
        .setLabel("문서 종류")
        .setValue("기획서 | 보고서")
        .setPlaceholder("기획서 | 보고서")
        .setStyle(TextInputStyle.Short);
      const notionSyncType = new TextInputBuilder()
        .setCustomId("notionSyncType")
        .setLabel("유형")
        .setValue(
          "건축 프로젝트 | 인프라 구축 | 페리미터 | 컨텐츠 제작  | 기타 | 공장 | 맵아트"
        )
        .setPlaceholder(
          "건축 프로젝트 | 인프라 구축 | 페리미터 | 컨텐츠 제작  | 기타 | 공장 | 맵아트"
        )
        .setStyle(TextInputStyle.Short);
      const notionSyncPriority = new TextInputBuilder()
        .setCustomId("notionSyncPriority")
        .setLabel("우선순위")
        .setValue("높음 | 보통 | 낮음 | 기타 | 검토 중")
        .setPlaceholder("높음 | 보통 | 낮음 | 기타 | 검토 중")
        .setStyle(TextInputStyle.Short);
      const notionSyncRow = new ActionRowBuilder().addComponents(
        notionSyncTitle,
        notionSyncWorkState,
        notionSyncPageType,
        notionSyncType,
        notionSyncPriority
      );
      notionSyncModal.addComponents(notionSyncRow);
      await interaction.showModal(notionSyncModal);
      break;
  }
  /**
   * Get data from read file with channel id
   * @param {Array} read read file of publicChannel.json
   * @param {Discord.Snowflake} channelId
   * @returns {object}
   */
  function getPropFromChannelRead(read, channelId) {
    for (let i = 0; i < read.length; i++) {
      switch (channelId) {
        case read[i].public.id:
          return read[i];
        case read[i].nanocraft.id:
          return read[i];
      }
    }
  }
}
/**
 * @description Discord Autocomplete Interaction
 * @param {Discord.AutocompleteInteraction} interaction
 */
async function autocomplete(interaction) {
  switch (interaction.commandName) {
    case "리플레이":
      let list = [];
      let projects = util.readFile("../data/projects.json");
      for (let project of projects) {
        list.push({
          name: project.name,
          value: project.name,
        });
      }
      if (list.length > 25) list.length = 25;

      await interaction.respond(list);
      break;
    case "불러오기":
      break;
  }
}
/**
 * @type async function
 * @description Discord Modal Interaction
 * @param {Discord.ModalSubmitInteraction} interaction
 */
async function modal(interaction) {
  const lang = util.setLang(interaction.locale);
  switch (interaction.customId) {
    case "bugReport":
      const bugfeatureRes = interaction.fields.getTextInputValue("bugfeature");
      const howtobugRes = interaction.fields.getTextInputValue("howtobug");
      const bugDescriptionRes =
        interaction.fields.getTextInputValue("bugDescription");
      const bugReportEmbed = new Discord.EmbedBuilder()
        .setTitle("버그 제보")
        .addFields(
          { name: "버그가 발생한 기능", value: bugfeatureRes },
          { name: "버그 재현 방법", value: howtobugRes },
          { name: "버그 설명", value: bugDescriptionRes }
        )
        .setColor("Red");
      await interaction.channel.send({ embeds: [bugReportEmbed] });
      await interaction.reply({
        ephemeral: true,
        content: lang.interaction.modal.reponse,
      });
      break;
    case "report":
      const reportUserRes = interaction.fields.getTextInputValue("reportUser");
      const reportReasonRes =
        interaction.fields.getTextInputValue("reportReason");

      const reportEmbed = new Discord.EmbedBuilder()
        .setTitle("신고")
        .addFields(
          { name: "신고 대상", value: reportUserRes, inline: true },
          { name: "신고 사유", value: reportReasonRes, inline: true }
        )
        .setColor("Red");
      await interaction.channel.send({ embeds: [reportEmbed] });
      await interaction.reply({
        ephemeral: true,
        content: lang.interaction.modal.reponse,
      });
      break;
    case "upServer":
      const howUpRes = interaction.fields.getTextInputValue("howUp");
      const upDescriptionRes =
        interaction.fields.getTextInputValue("upDescription");
      const whyUpRes = interaction.fields.getTextInputValue("whyUp");
      const upServerEmbed = new Discord.EmbedBuilder()
        .setTitle("서버 개선 문의")
        .addFields(
          { name: "수정 부분", value: howUpRes },
          { name: "설명", value: upDescriptionRes },
          { name: "수정 이유", value: whyUpRes }
        )
        .setColor("Blue");
      await interaction.channel.send({ embeds: [upServerEmbed] });
      await interaction.reply({
        ephemeral: true,
        content: lang.interaction.modal.reponse,
      });
      break;
    case "qnaServer":
      const howqnaRes = interaction.fields.getTextInputValue("howqna");
      const qnaDescriptionRes =
        interaction.fields.getTextInputValue("qnaDescription");
      const qnaServerEmbed = new Discord.EmbedBuilder()
        .setTitle("서버 질문")
        .addFields(
          { name: "질문 부분", value: howqnaRes },
          { name: "설명", value: qnaDescriptionRes }
        )
        .setColor("Blue");
      await interaction.channel.send({ embeds: [qnaServerEmbed] });
      await interaction.reply({
        ephemeral: true,
        content: lang.interaction.modal.reponse,
      });
      break;
    case "memberAdd":
      const whatmadeRes = interaction.fields.getTextInputValue("whatmade");
      const whoismeRes = interaction.fields.getTextInputValue("whoisme");
      const howtechnicalRes =
        interaction.fields.getTextInputValue("howtechnical");
      const goalRes = interaction.fields.getTextInputValue("goal");
      const mikeageRes = interaction.fields.getTextInputValue("mikeage");
      const memberAddEmbed = new Discord.EmbedBuilder()
        .setTitle("Nanocraft SMP 신청")
        .addFields(
          { name: "제작한 건축물 / 장치", value: whatmadeRes },
          { name: "자기소개", value: whoismeRes },
          {
            name: "테크니컬에 입문한 계기",
            value: howtechnicalRes,
          },
          { name: "목표 의식", value: goalRes },
          { name: "마이크 사용 여부 및 나이", value: mikeageRes }
        )
        .setColor("Green");
      await interaction.channel.send({ embeds: [memberAddEmbed] });
      await interaction.reply({
        ephemeral: true,
        content: lang.interaction.modal.reponse,
      });
      break;
    case "other":
      const otherDescriptionRes =
        interaction.fields.getTextInputValue("otherDescription");

      const otherEmbed = new Discord.EmbedBuilder()
        .setTitle("기타")
        .setDescription(otherDescriptionRes);
      await interaction.channel.send({ embeds: [otherEmbed] });
      await interaction.reply({
        ephemeral: true,
        content: lang.interaction.modal.reponse,
      });
      break;
    case "shortUrlGen":
      const originalUrl =
        interaction.fields.getTextInputValue("originalUrlInput");
      const expirationTime = interaction.fields.getTextInputValue(
        "expirationTimeInput"
      );

      if (
        !originalUrl.match(
          /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/
        )
      ) {
        const e = new EmbedBuilder()
          .setTitle("올바른 URL값이 아닙니다.")
          .setDescription("올바른 URL값을 입력해주세요.")
          .setColor(0xff0000);
        return await interaction.reply({ embeds: [e], ephemeral: true });
      }
      if (!expirationTime.match(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)) {
        const e = new EmbedBuilder()
          .setTitle("올바른 시간을 입력해주세요")
          .setColor(0xff0000)
          .setDescription("HH:MM 형식으로 입력해주세요");
        return await interaction.reply({ embeds: [e], ephemeral: true });
      }

      await fetch(
        `http://localhost:${process.env.PORT}/api/add?originalUrl=${originalUrl}&expirationTime=${expirationTime}`
      )
        .then((res) => res.json())
        .then((json) => {
          const e = new EmbedBuilder()
            .setColor(0x00ae86)
            .setTitle("단축 링크 생성이 완료되었습니다")
            .addFields([
              {
                name: "📥 단축 링크",
                value: `http://localhost:${process.env.PORT}/${json.shortUrlId}`,
              },
              {
                name: "📤 원본 URL",
                value: json.originalUrl,
              },
              {
                name: "🕗 유효 시간",
                value: json.expirationTime,
              },
            ]);
          return interaction.reply({ embeds: [e] });
        });
      break;
    case "uploadNotion":
      const pageTitle = interaction.fields.getTextInputValue("pagetitle");
      let pageType = interaction.fields.getTextInputValue("pagetype");
      const pageDes = interaction.fields.getTextInputValue("pagedescription");
      const pageFileUrl = interaction.fields.getTextInputValue("pagefileurl");
      const Notion = new notion.Client({ auth: config.notionApiKey });
      const parentId = "706896a8c12640c4b3c7b5890efdcccd";

      let option = {
        parent: {
          type: "database_id",
          database_id: parentId,
        },
        properties: {
          Name: {
            title: [
              {
                text: {
                  content: pageTitle,
                },
              },
            ],
          },
          문의유형: {
            select: {
              name: pageType.trimEnd() + " 문의",
            },
          },
        },
        children: [
          {
            type: "file",
            //...other keys excluded
            file: {
              type: "external",
              external: {
                url: pageFileUrl,
              },
            },
          },
        ],
      };
      if (pageDes) {
        option.children.push({
          object: "block",
          paragraph: {
            rich_text: [
              {
                text: {
                  content: pageDes,
                },
              },
            ],
          },
        });
      }

      const response = await Notion.pages.create(option);
      await interaction.reply({
        ephemeral: true,
        content: `${lang.interaction.modal.upload}\n` + response.url,
      });

      break;
    case "notionSync":
      const nsworkState = interaction.fields
        .getTextInputValue("notionSyncWorkState")
        .trimEnd();
      const nsTitle = interaction.fields
        .getTextInputValue("notionSyncTitle")
        .trimEnd();
      const nspageType = interaction.fields
        .getTextInputValue("notionSyncPageType")
        .trimEnd();
      const nsType = interaction.fields
        .getTextInputValue("notionSyncType")
        .trimEnd();
      const nsPriority = interaction.fields
        .getTextInputValue("notionSyncPriority")
        .trimEnd();
      const nsNotion = new notion.Client({ auth: config.notionApiKey });
      const nsparentId = "d6b58a25dfb3459a9be3f8f7fc4ce8f1";

      let workArray = ["진행 전", "진행 중", "진행 완료", "To Do"];
      let pagetypeArray = ["기획서", "보고서"];
      let typeArray = [
        "건축 프로젝트",
        "인프라 구축",
        "페리미터",
        "컨텐츠 제작",
        "기타",
        "공장",
        "맵아트",
      ];
      let priorityArray = ["높음", "보통", "낮음", "기타", "검토 중"];
      /**
       *
       * @param {String} what
       * @param {Array} array
       * @returns
       */
      let errOpt = async (what, array) => {
        let errOptEmbed = new Discord.EmbedBuilder()
          .setTitle("Error: 잘못된 형식")
          .setColor("Red")
          .setDescription(
            `${what}은 ${array.toString} 안에 포함되어야 합니다.`
          );
        return await interaction.reply({
          ephemeral: true,
          embeds: [errOptEmbed],
        });
      };
      if (!workArray.find((item) => item === nsworkState)) {
        return errOpt(nsworkState, workArray);
      }
      if (!pagetypeArray.find((item) => item === nspageType)) {
        return errOpt(nspageType, pagetypeArray);
      }
      if (!typeArray.find((item) => item === nsType)) {
        return errOpt(nsType, typeArray);
      }
      if (!priorityArray.find((item) => item === nsPriority)) {
        return errOpt(nsPriority, priorityArray);
      }

      let nsOption = {
        parent: {
          type: "database_id",
          database_id: nsparentId,
        },
        properties: {
          Name: {
            title: [
              {
                text: {
                  content: nsTitle ?? "제목 없음",
                },
              },
            ],
          },
          "작업 상태": {
            select: {
              name: nsworkState,
            },
          },
          "문서 종류": {
            select: {
              name: nspageType,
            },
          },
          유형: {
            select: {
              name: nsType,
            },
          },
          우선순위: {
            select: {
              name: nsPriority,
            },
          },
        },
      };
      const nsresponse = await nsNotion.pages.create(nsOption);
      let SuccessEmbed = new Discord.EmbedBuilder()
        .setTitle("동기화 성공")
        .setColor("Green")
        .setDescription(
          `스레드가 [노션 페이지](${nsresponse.url})에 연동되었습니다.`
        );
      await interaction.reply({ ephemeral: true, embeds: [SuccessEmbed] });
      await interaction.channel.permissionOverwrites.set([
        {
          id: interaction.guild.roles.everyone,
          allow: [PermissionsBitField.Flags.SendMessages],
        },
      ]);
      break;
  }
}

module.exports.stopvote = stopvote;

async function stopvote(seed) {
  if (!fs.existsSync(require.resolve("../data/vote.json")))
    fs.writeFileSync(require.resolve("../data/vote.json"), JSON.stringify({}));
  const dataRead = fs.readFileSync(
    require.resolve("../data/vote.json"),
    "utf8"
  );
  const voteData = JSON.parse(dataRead);
  const data = voteData[seed];
  if (!data) {
    return false;
  }
  data["client"] = client;
  const Vote = new vote(data);
  await Vote.stopVote();
}
