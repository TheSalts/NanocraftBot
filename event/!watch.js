const chokidar = require("chokidar");

const { token } = require("../config.json");
const Discord = require("discord.js");
const Path = require("path");

const { Client, GatewayIntentBits, Partials } = require("discord.js");
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
  partials: [Partials.Channel, Partials.Message],
});

const config = require("../config.json");
const wait = require("node:timers/promises").setTimeout;
const fs = require("fs");
const readline = require("readline");
const { google } = require("googleapis");

const SCOPES = ["https://www.googleapis.com/auth/drive"];

const TOKEN_PATH = "../data/token.json";

client.on("ready", () =>
  console.log("[Watch] 디스코드와 연결에 성공했습니다.")
);

//Discord
if (!fs.existsSync(config.filepath)) fs.mkdirSync(config.filepath);

chokidar
  .watch(config.filepath, {
    ignoreInitial: true,
    awaitWriteFinish: {
      stabilityThreshold: 2000,
      pollInterval: 100,
    },
  })
  .on("ready", () => {
    console.log("[watch] 파일 감시를 시작합니다.");
  })
  .on("add", async (path, event) => {
    if (Path.extname(path) != ".mcpr") return;
    let filename = Path.basename(path);
    await wait(5000);
    var stats = fs.statSync(path);
    var fileSizeInBytes = stats.size;
    var fileSizeInMegabytes = fileSizeInBytes / (1024 * 1024);
    fs.readFile("../data/credentials.json", (err, content) => {
      if (err) return console.log("Error loading client secret file:", err);
      authorize(
        JSON.parse(content),
        storeFiles,
        filename,
        path,
        fileSizeInMegabytes
      );
    });
  });

client.login(token);

// google drive

async function authorize(credentials, callback, filename, filepath, filesize) {
  const { client_secret, client_id, redirect_uris } = credentials.web;
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );

  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) {
      return getAccessToken(oAuth2Client, callback);
    }
    oAuth2Client.setCredentials(JSON.parse(token));
    oAuth2Client.refreshAccessToken((err, tokens) => {
      oAuth2Client.setCredentials({ access_token: tokens.access_token });
      let read = fs.readFileSync("../data/token.json", "utf8");
      let tokenfile = JSON.parse(read);
      tokenfile.access_token = tokens.access_token;
      fs.writeFileSync("../data/token.json", JSON.stringify(tokenfile));
      storeFiles(oAuth2Client, filename, filepath, filesize);
    });
  });
}

function storeFiles(auth, filename, filepath, filesize) {
  const drive = google.drive({ version: "v3", auth });
  const read = JSON.parse(fs.readFileSync("../config.json", "utf8"));
  let parent = ["1l1jatTkGWFV-XsLk-MasMV17QHtmWPeg"];
  if (read.project) parent = [read.project];

  var fileMetadata = {
    name: filename,
    parents: parent,
  };
  var media = {
    // mimeType: "text/plain",
    //PATH OF THE FILE FROM YOUR COMPUTER
    body: fs.createReadStream(filepath),
  };
  drive.files.create(
    {
      resource: fileMetadata,
      media: media,
      fields: "id",
    },
    function (err, file) {
      if (err) {
        // Handle error
        console.error(err);
      } else {
        const resource = { role: "reader", type: "anyone" };
        drive.permissions.create(
          { fileId: file.data.id, resource: resource },
          (error, result) => {
            if (error) return console.error(error);
          }
        );
        console.log("드라이브에 성공적으로 업로드했습니다. Id: ", file.data.id);
        let sendChannels = client.channels.cache.get(config.sendChannel);
        let sendchannel2 = client.channels.cache.get("987045539000496143");
        let url = `https://drive.google.com/file/d/${file.data.id}/view?usp=sharing`;
        const embed = new Discord.EmbedBuilder()
          .setTitle("리플레이 업로드 성공")
          .addFields(
            { name: "파일", value: filename, inline: true },
            { name: "용량", value: Math.floor(filesize) + "MB", inline: true }
          )
          .setColor("#33FF99")
          .setURL(url)
          .setTimestamp();
        if (read.project) {
          for (let project of JSON.parse(
            fs.readFileSync("../data/projects.json", "utf8")
          )) {
            if (project.id == read.project) {
              embed.setDescription(`**${project.name}** 프로젝트에 포함됨`);
            }
          }
        }
        sendChannels.send({ embeds: [embed] });
        sendchannel2.send({ embeds: [embed] });
      }
    }
  );
}

function getAccessToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
  });
  console.log("Authorize this app by visiting this url:", authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question("Enter the code from that page here: ", (code) => {
    rl.close();

    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error("Error retrieving access token", err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log("Token stored to", TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}
