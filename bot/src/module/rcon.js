const config = require("../config.json");
const util = require("minecraft-server-util");
const client = new util.RCON(config.ip, {
  password: config.rconpw,
  port: config.rconport,
  enableSRV: true,
});

client.on("output", async (message) => {
  console.log(message);

  // The client must be closed AFTER receiving the message.
  // Closing too early will cause the client to never output
  // any message.
  client.close();
});
