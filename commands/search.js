const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("검색")
    .setDescription("구글에서 검색합니다.")
    .addStringOption((option) =>
      option.setName("검색어").setDescription("검색어").setRequired(true)
    ),
  async execute(interaction) {
    await interaction.reply({
      ephemeral: true,
      content:
        "검색 결과를 불러오는 중...\n메시지가 지속될 경우 관리자에게 문의하세요.",
    });
    const Discord = require("discord.js");
    const googleIt = require("google-it");
    const option1 = interaction.options.getString("검색어");
    const fs = require("fs");

    await googleIt({ query: option1 })
      .then(async (results) => {
        var list = results;
        var embedList = [];
        async function addEmbed(embed) {
          embedList.push(embed);
        }
        function getSeed() {
          return parseInt(
            Math.floor((Math.random() * Math.random() + 19) * 573154123)
              .toString()
              .substring(0, 6)
          );
        }
        let seed = getSeed();

        for (let i = 0; i < list.length; i++) {
          let Embed = new Discord.EmbedBuilder()
            .setTitle(`${list[i].title}`)
            .setColor("Blue")
            .setDescription(`${list[i].snippet}`)
            .setURL(`${list[i].link}`)
            .setTimestamp()
            .setFooter({
              text:
                "검색: " +
                interaction.member.user.tag +
                " • 검색어: " +
                option1,
              iconURL: interaction.member.user.displayAvatarURL(),
            });

          await addEmbed(Embed);
        }

        function getEmbedList() {
          let array = [];

          for (let i = 0; i < embedList.length; i++) {
            let titles = "";

            if (embedList[i].data.title.length > 100)
              titles = embedList[i].data.title.substring(0, 50) + "...";
            else titles = embedList[i].data.title;
            array.push({
              label: titles,
              description:
                embedList[i].data.description.substring(0, 50) + "...",
              value: `${seed}${i}s`,
            });
          }
          return array;
        }

        const menu = new Discord.ActionRowBuilder().addComponents(
          new Discord.SelectMenuBuilder()
            .setCustomId("searchResult")
            .setPlaceholder("공유할 검색 결과를 선택하세요")
            .addOptions(getEmbedList())
            .setMaxValues(1)
        );

        let message = "";
        await interaction.editReply({
          ephemeral: true,
          embeds: embedList,
          components: [menu],
        });
        await interaction
          .fetchReply()
          .then((reply) => (message = reply.id))
          .catch(console.error);
        embedList.push({ seed: seed, msgid: message });
        if (!fs.existsSync("./data/search.json"))
          fs.writeFileSync("./data/search.json", JSON.stringify([]));
        let read = fs.readFileSync("./data/search.json", "utf8");
        let search = JSON.parse(read);

        for (let i = 0; i < search.length; i++) {
          if (search[i].length > 10) search[i].splice(search[i].length - 1, 1);
        }

        await search.push(embedList);

        fs.writeFileSync("./data/search.json", JSON.stringify(search));
      })
      .catch((e) => {
        console.error(e);
      });
  },
};
