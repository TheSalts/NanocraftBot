const { SlashCommandBuilder } = require("@discordjs/builders");
const Discord = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("reloadbot")
    .setDescription("봇을 재시작합니다. MOD만 사용 가능합니다.")
    .addStringOption((option) =>
      option
        .setName("프로세스")
        .setDescription("프로세스 이름 | default: all")
        .setRequired(false)
        .setChoices(
          { name: "전체", value: "all" },
          { name: "Captcha", value: "Captcha" },
          { name: "문의 버튼", value: "channelAdd" },
          { name: "명령어", value: "index" },
          { name: "상호작용", value: "interaction" },
          { name: "환영메시지", value: "memberAdd" },
          { name: "메시지 로그", value: "msglog" },
          { name: "✅│크리-서버 서버상태", value: "playerinfo-c" },
          { name: "📌│서버상태 서버상태", value: "playerinfo-n" },
          { name: "이모지 사용", value: "reactionAdd" },
          { name: "노션 api", value: "notion" }
        )
    ),
  /**
   *
   * @param {Discord.CommandInteraction} interaction
   * @returns
   */
  async execute(interaction) {
    var processName = interaction.options.getString("프로세스");
    if (!processName) processName = "all";
    // var kill = require("tree-kill");
    var spawn = require("child_process").spawn;
    if (!interaction.member.roles.cache.some((role) => role.name === "MOD")) {
      const permissionEmbed = new Discord.EmbedBuilder()
        .setTitle("에러: 권한이 없습니다.")
        .setColor("#FF0000");
      return await interaction.reply({
        ephemeral: true,
        embeds: [permissionEmbed],
      });
    }
    await interaction.reply({
      ephemeral: true,
      content: "봇을 재시작합니다.\n프로세스: " + processName,
    });
    let process = spawn("bash");
    process.stdin.write(`pm2 reload ${processName}\n`);
    process.stdin.end();
    let dataArray = [];
    /**
     * @param {Array} array
     */
    function getData(array) {
      let string = "";
      array.forEach((element) => {
        string + element + "\n";
      });
      return string;
    }

    process.stdout.on("data", (data) => {
      let dataString = data.toString();
      dataArray.push(dataString);
    });

    process.stdout.on("close", (data) => {
      interaction.followUp({ ephemeral: true, content: getData(dataArray) });
    });
  },
};
