const config = require("../config.json");
const { Client, GatewayIntentBits, Partials } = require("discord.js");
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel, Partials.Message, Partials.User],
});
const { spawn } = require("child_process");
const fs = require("fs");

client.login(config.token);

client.once("ready", () => {
  console.log("menu_cr ready");
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isButton()) return;
  if (interaction?.customId !== "server_CREATIVE") return;
  if (
    !interaction.member.roles.cache.some(
      (role) => role.name === "NANOCRAFT SMP"
    )
  )
    return;
  await interaction.message.reply(
    `**${interaction.member.user.tag}**님이 동의했습니다.`
  );
  if (!fs.existsSync("../data/serverstart.json"))
    fs.writeFileSync("../data/serverstart.json", JSON.stringify([]));
  let read = JSON.parse(fs.readFileSync("../data/serverstart.json"));
  if (read[0] === 1) command();
  fs.writeFileSync("../data/serverstart.json", JSON.stringify([1]));

  async function command() {
    try {
      let process = spawn("powershell.exe");
      process.stdin.write("C:/Users/nanocraft/Desktop/Server/start.cmd");
      process.stdin.end();
      await interaction.message.edit({
        components: [],
        content: "서버를 실행했습니다.",
      });
      fs.writeFileSync("../data/serverstart.json", JSON.stringify([]));
    } catch (e) {
      console.error(e);
    }
  }
});
