const { Client, GatewayIntentBits, Partials } = require("discord.js");

const { token } = require("../config.json");

const Discord = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildIntegrations,
    GatewayIntentBits.GuildWebhooks,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.MessageContent,
  ],
  partials: [
    Partials.Channel,
    Partials.Message,
    Partials.ThreadMember,
    Partials.User,
    Partials.GuildMember,
  ],
});

client.login(token);

client.on("messageCreate", async (message) => {
  if (message.content === "!n메시지") {
    let embed = new Discord.EmbedBuilder()
      .setTitle("화이트리스트 신청")
      .setDescription(
        "나노크래프트 크리에이티브 서버에 접속하려면 아래 버튼을 누르고 인증을 완료하세요!\nTo access the Nanocraft creative server, press the button and complete the authentication!"
      )
      .setColor("Green")
      .setImage(
        "https://images-ext-2.discordapp.net/external/5AdIh3iU7evRe_itSM3VIUBvKjZ_FICVN0d7wNer1WY/https/media1.tenor.com/images/7e4957df538eb4db4006fe0d34aea82e/tenor.gif"
      );
    const row = new Discord.ActionRowBuilder().addComponents(
      new Discord.ButtonBuilder()
        .setCustomId("whitelist")
        .setLabel("인증")
        .setStyle(Discord.ButtonStyle.Success)
    );
    await message.channel.send({ embeds: [embed], components: [row] });
  }
});
