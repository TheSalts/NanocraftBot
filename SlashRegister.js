const { REST } = require("@discordjs/rest");
const { Routes } = require("discord.js");
const { token } = require("./config.json");
const fs = require("fs");

const commands = [];
const commandFiles = fs
  .readdirSync("./commands")
  .filter((file) => file.endsWith(".js"));

// Place your client and guild ids here
const clientId = "957579723951714334";
const guildId = "905731712582053950";

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  commands.push(command.data.toJSON());
}
const rest = new REST({ version: "10" }).setToken(token);

(async () => {
  try {
    console.log("슬래시 커맨드 리로드 중");

    await rest.put(Routes.applicationCommands(clientId /*, guildId*/), {
      body: commands,
    });

    console.log("슬래시 커맨드 리로드 성공");
  } catch (error) {
    console.error(error);
  }
})();
