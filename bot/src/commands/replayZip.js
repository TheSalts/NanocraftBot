const { SlashCommandBuilder } = require("@discordjs/builders");
const { file } = require("googleapis/build/src/apis/file");
const path = require("path");
const quick = require("../util/quick");
const util = require("../util/util");
const dataApi = require("../util/dataApi");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("replay")
    .setNameLocalizations({ "en-US": "replay", ko: "리플레이" })
    .setDescription("download replay files.")
    .setDescriptionLocalizations({
      "en-US": "download replay files.",
      ko: "리플레이 파일을 다운로드합니다.",
    })
    .addSubcommand((subcommand) =>
      subcommand
        .setName("download")
        .setNameLocalizations({ "en-US": "download", ko: "다운로드" })
        .setDescription("download replay files.")
        .setDescriptionLocalizations({
          "en-US": "download replay files.",
          ko: "리플레이 파일을 다운로드합니다.",
        })
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("project")
        .setNameLocalizations({ "en-US": "project", ko: "프로젝트" })
        .setDescription("project")
        .setDescriptionLocalizations({ "en-US": "project", ko: "프로젝트" })
        .addStringOption((option) =>
          option
            .setName("name")
            .setNameLocalizations({ "en-US": "name", ko: "이름" })
            .setDescription("name")
            .setDescriptionLocalizations({ "en-US": "name", ko: "이름" })
            .setRequired(true)
            .setAutocomplete(true)
        )
        .addStringOption((option) =>
          option
            .setName("method")
            .setNameLocalizations({ "en-US": "method", ko: "동작" })
            .setDescription("method")
            .setDescriptionLocalizations({ "en-US": "method", ko: "동작" })
            .setRequired(true)
            .addChoices(
              {
                name: "execute",
                name_localizations: { "en-US": "execute", ko: "실행" },
                value: "실행",
              },
              {
                name: "stop",
                name_localizations: { "en-US": "stop", ko: "중단" },
                value: "중단",
              }
            )
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("addproject")
        .setNameLocalizations({ "en-US": "addproject", ko: "프로젝트생성" })
        .setDescription("Add project")
        .setDescriptionLocalizations({
          "en-US": "Add project.",
          ko: "프로젝트를 추가합니다.",
        })
        .addStringOption((option) =>
          option
            .setName("name")
            .setNameLocalizations({ "en-US": "name", ko: "이름" })
            .setDescription("name")
            .setDescriptionLocalizations({
              "en-US": "Project name",
              ko: "프로젝트 이름",
            })
            .setRequired(true)
            .setAutocomplete(true)
        )
    ),
  /**
   *
   * @param {Discord.CommandInteraction} interaction
   * @returns
   */
  async execute(interaction /*,logchannel*/) {
    const lang = util.setLang(interaction.locale);
    const { InteractionType } = require("discord.js");
    if (interaction.type !== InteractionType.ApplicationCommand) return;
    await interaction.deferReply({
      ephemeral: true,
    });
    const chokidar = require("chokidar");

    const Discord = require("discord.js");
    const Path = require("path");

    const config = require("../config.json");

    const fs = require("fs");
    const readline = require("readline");
    const { google } = require("googleapis");

    const SCOPES = ["https://www.googleapis.com/auth/drive"];

    const TOKEN_PATH = "./data/token.json";

    if (interaction.options.getSubcommand() === "download") {
      await download();
    } else if (interaction.options.getSubcommand() === "project") {
      await project();
    } else if (interaction.options.getSubcommand() === "addproject") {
      await createProject();
    }

    async function createProject() {
      if (
        interaction.member.roles.cache.some(
          (role) => role.name === "NANOCRAFT SMP"
        ) ||
        interaction.member.roles.cache.some(
          (role) => role.name === "Trial Member"
        ) ||
        interaction.member.roles.cache.some((role) => role.name === "MOD")
      ) {
      } else {
        return quick.sendPermissionErrorEmbed(interaction, "MOD");
      }
      const name = interaction.options.getString("name");
      await createfolder(name);
    }

    async function createfolder(name) {
      let readproject = util.readFile(path.resolve("./data/projects.json"));
      for (let project of readproject) {
        if (project.name == name)
          return await interaction.editReply(lang.replay.alert.alreadyExists);
      }
      fs.readFile("./data/credentials.json", (err, content) => {
        if (err) return console.log("Error loading client secret file:", err);
        authorize(JSON.parse(content), storeFolder);
      });
      function storeFolder(auth) {
        const drive = google.drive({ version: "v3", auth });
        var fileMetadata = {
          name: name,
          mimeType: "application/vnd.google-apps.folder",
          parents: ["1l1jatTkGWFV-XsLk-MasMV17QHtmWPeg"],
        };
        drive.files.create(
          {
            resource: fileMetadata,
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
              interaction.editReply(
                lang.replay.alert.successAdd
                  .replaceAll("${name}", name)
                  .replaceAll("${file.data.id}", file.data.id)
              );
              let readprojects = fs.readFileSync(
                "./data/projects.json",
                "utf8"
              );
              let pj = JSON.parse(readprojects);
              const dataApi = require("../util/dataApi");
              dataApi.upload({
                type: "project",
                name: name,
                value: file.data.id,
              });
              pj.push({ name: name, id: file.data.id });
              fs.writeFileSync("./data/projects.json", JSON.stringify(pj));
            }
          }
        );
      }
      async function authorize(credentials, callback, filesize) {
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
            oAuth2Client.setCredentials({
              access_token: tokens.access_token,
            });
            let read = fs.readFileSync("./data/token.json", "utf8");
            let tokenfile = JSON.parse(read);
            tokenfile.access_token = tokens.access_token;
            fs.writeFileSync("./data/token.json", JSON.stringify(tokenfile));
            storeFolder(oAuth2Client, filesize);
          });
        });
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
    }

    async function project() {
      if (
        interaction.member.roles.cache.some(
          (role) => role.name === "NANOCRAFT SMP"
        ) ||
        interaction.member.roles.cache.some(
          (role) => role.name === "Trial Member"
        ) ||
        interaction.member.roles.cache.some((role) => role.name === "MOD")
      ) {
      } else {
        return quick.sendPermissionErrorEmbed(interaction, "MOD");
      }

      const name = interaction.options.getString("name");
      const execute = interaction.options.getString("method");

      let alreadyRun = false;
      let getData = await dataApi.get({ type: "project", name: name });
      if (!getData[0]) {
        getData = await dataApi.get({ type: "replayProject", name: name });
        alreadyRun = true;
      }
      if (execute == "execute") {
        if (alreadyRun === true)
          return await interaction.editReply(
            lang.replay.alert.alreadyRunning.replaceAll("${name}", name)
          );
        await dataApi.edit(
          { id: getData[0].id },
          { editType: "replayProject" }
        );
        await interaction.editReply(lang.replay.alert.run);
      } else if (execute == "stop") {
        await dataApi.edit({ id: getData[0].id }, { editType: "project" });
        await interaction.editReply(lang.replay.alert.stop);
      }

      return;
    }

    async function download() {
      if (
        !(
          interaction.member.roles.cache.find(
            (role) => role.name === "Trial Member"
          ) ||
          interaction.member.roles.cache.find(
            (role) => role.name === "NANOCRAFT SMP"
          ) ||
          interaction.member.roles.cache.find((role) => role.name === "MOD") ||
          interaction.member.roles.cache.find((role) => role.name === "STAFF")
        )
      )
        return quick.sendPermissionErrorEmbed(interaction, "나노크래프트 접근"); //Trial member || Nanocraft SMP
      if (!fs.existsSync(config.filepath)) fs.mkdirSync(config.filepath);

      let projectname = "";
      let projectid = "1l1jatTkGWFV-XsLk-MasMV17QHtmWPeg";

      let getData = await dataApi.get({ type: "replayProject" });
      projectid = getData[0].value;
      projectname = getData[0].name;

      let pname;
      if (lang.language === "ko") pname = projectname || "리플레이";
      else pname = projectname || "Replay";

      let url = `https://drive.google.com/drive/folders/${projectid}?usp=sharing`;

      const embed = new Discord.EmbedBuilder()
        .setTitle(pname)
        .setDescription(
          lang.replay.embed.description
            .replaceAll("${projectname}", projectname)
            .replaceAll("${url}", url)
        )
        .setColor("#33FF99")
        .setURL(url)
        .setTimestamp()
        .setImage("https://i.imgur.com/o3oSddy.png");
      await interaction.member.user
        .send({ embeds: [embed] })
        .then((msg) => {
          interaction.editReply({
            ephemeral: true,
            content: lang.replay.alert.filesent.replaceAll(
              "${msg.url}",
              msg.url
            ),
          });
        })
        .catch(() => {
          const errEmbed = new Discord.EmbedBuilder()
            .setTitle(lang.replay.embed.error.title)
            .setDescription(lang.replay.embed.error.description)
            .setColor("#FF0000")
            .setImage("https://i.imgur.com/WQlZLmO.png");
          interaction.editReply({
            embeds: [errEmbed],
            ephemeral: true,
          });
          deleteFile(file.data.id);
        });
      return;

      // fs.readFile("./data/credentials.json", (err, content) => {
      //   if (err) return console.log("Error loading client secret file:", err);
      //   authorize(JSON.parse(content), storeFiles, fileSizeInMegabytes);
      // });

      // google drive
      async function authorize(credentials, callback, filesize) {
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
            let read = fs.readFileSync("./data/token.json", "utf8");
            let tokenfile = JSON.parse(read);
            tokenfile.access_token = tokens.access_token;
            fs.writeFileSync("./data/token.json", JSON.stringify(tokenfile));
            callback(oAuth2Client, filesize);
          });
        });
      }

      function storeFiles(auth, filesize) {
        const drive = google.drive({ version: "v3", auth });
        var fileMetadata = {
          name: "PCRC.zip",
        };
        var media = {
          //  mimeType: "text/plain",
          //PATH OF THE FILE FROM YOUR COMPUTER
          body: fs.createReadStream("PCRC.zip"),
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
              console.log(
                "드라이브에 성공적으로 업로드했습니다. Id: ",
                file.data.id
              );

              let url = `https://drive.google.com/file/d/${file.data.id}/view?usp=sharing`;
              let date = new Date();
              let day = date.getDate();
              let month = date.getMonth() + 1;
              let year = date.getFullYear();
              let hours = date.getHours();
              let minutes = date.getMinutes();
              let seconds = date.getSeconds();
              const embed = new Discord.EmbedBuilder()
                .setTitle("PCRC.zip")
                .setDescription(
                  "링크를 생성한지 5분이 지나면 링크가 만료되므로 주의하세요.\n" +
                    `만료 시간: ${year}년 ${month}월 ${day}일 ${hours}시 ${
                      minutes + 5
                    }분 ${seconds}초`
                )
                .addFields({
                  name: "용량",
                  value: Math.floor(filesize) + "MB",
                  inline: true,
                })
                .setColor("#33FF99")
                .setURL(url)
                .setTimestamp();
              const wait = require("node:timers/promises").setTimeout;
              interaction.member.user
                .send({ embeds: [embed] })
                .then((msg) => {
                  interaction.editReply({
                    ephemeral: true,
                    content: `파일을 [DM](${msg.url})으로 전송했어요!`,
                  });
                  wait(1000 * 300).then(() => {
                    const embeds = new Discord.EmbedBuilder()
                      .setTitle("PCRC.zip")
                      .setDescription("링크가 만료되었어요.")
                      .setColor("#33FF99")
                      .setTimestamp();
                    msg.edit({
                      embeds: [embeds],
                      content: "링크를 더이상 사용할 수 없어요.",
                    });
                  });
                })
                .catch(() => {
                  const errEmbed = new Discord.EmbedBuilder()
                    .setTitle("에러: DM을 보낼 수 없습니다.")
                    .setDescription(
                      "개인정보 보호 설정 > 서버 멤버가 보내는 다이렉트 메시지 허용하기를 체크해주셔야 다운로드가 가능합니다."
                    )
                    .setColor("#FF0000")
                    .setImage("https://i.imgur.com/WQlZLmO.png");
                  interaction.editReply({
                    embeds: [errEmbed],
                    ephemeral: true,
                  });
                  deleteFile(file.data.id);
                });
            }
          }
        );
      }

      function deleteFile(fileId) {
        const drive = google.drive({ version: "v3", auth });
        var request = drive.files.delete({
          fileId: fileId,
        });
        request.execute(function (resp) {});
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
    }
  },
};
