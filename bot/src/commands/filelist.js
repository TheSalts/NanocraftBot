const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("backupfile")
    .setNameLocalizations({ "en-US": "backupfile", ko: "백업파일" })
    .setDescription("View server backup files.")
    .setDescriptionLocalizations({
      "en-US": "View server backup files.",
      ko: "백업 파일을 보여줍니다.",
    }),
  async execute(interaction /*,logchannel*/) {
    await interaction.deferReply({ ephemeral: true });
    const fs = require("fs");
    const readline = require("readline");
    const { google } = require("googleapis");
    const Discord = require("discord.js");

    // If modifying these scopes, delete token.json.
    const SCOPES = ["https://www.googleapis.com/auth/drive"];
    // The file token.json stores the user's access and refresh tokens, and is
    // created automatically when the authorization flow completes for the first
    // time.
    const TOKEN_PATH = "./data/token.json";

    // Load client secrets from a local file.
    fs.readFile("./data/credentials.json", (err, content) => {
      if (err) return console.log("Error loading client secret file:", err);
      // Authorize a client with credentials, then call the Google Drive API.
      authorize(JSON.parse(content), listFiles);
    });

    /**
     * Create an OAuth2 client with the given credentials, and then execute the
     * given callback function.
     * @param {Object} credentials The authorization client credentials.
     * @param {function} callback The callback to call with the authorized client.
     */
    async function authorize(credentials, callback) {
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
          // oAuth2Client.setCredentials({ access_token: tokens.access_token });
          let read = fs.readFileSync("./data/token.json", "utf8");
          let tokenfile = JSON.parse(read);
          tokenfile.access_token = JSON.parse(token).access_token;
          fs.writeFileSync("./data/token.json", JSON.stringify(tokenfile));
          listFiles(oAuth2Client);
        });
      });
    }

    /**
     * Get and store new token after prompting for user authorization, and then
     * execute the given callback with the authorized OAuth2 client.
     * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
     * @param {getEventsCallback} callback The callback for the authorized client.
     */
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

    /**
     * Lists the names and IDs of up to 10 files.
     * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
     */
    function listFiles(auth) {
      const drive = google.drive({ version: "v3", auth });
      let ID_OF_THE_FOLDER = "137tUbt9p20dGh5bUnJVjnPRIJfOELpXW";
      drive.files.list(
        {
          pageSize: 10,
          fields: "nextPageToken, files(id, name)",
          q: `'${ID_OF_THE_FOLDER}' in parents and trashed=false`,
        },
        (err, res) => {
          if (err) return console.log("The API returned an error: " + err);

          const files = res.data.files;

          let Embed = new Discord.EmbedBuilder()
            .setTitle("백업 검색 결과")
            .setColor("Blue")
            .setTimestamp();
          let fileList = "";

          const resource = { role: "reader", type: "anyone" };
          if (files.length) {
            for (let i = 0; i < files.length; i++) {
              drive.permissions.create(
                { fileId: files[i].id, resource: resource },
                (error, result) => {
                  if (error) return console.error(error);
                }
              );
              let url = `https://drive.google.com/file/d/${files[i].id}/view?usp=sharing`;
              if (files.length - 1 == i) {
                fileList = fileList + `[${files[i].name}](${url})`;
                break;
              }
              fileList = fileList + `[${files[i].name}](${url})` + "\n";
            }
            Embed.setDescription(fileList);
            interaction.editReply({ ephemeral: true, embeds: [Embed] });
          } else {
            interaction.editReply({
              ephemeral: true,
              content: "백업된 파일이 없어요.",
            });
          }
        }
      );
    }
  },
};
