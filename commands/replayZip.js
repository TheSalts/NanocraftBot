const { SlashCommandBuilder } = require("@discordjs/builders");
const { file } = require("googleapis/build/src/apis/file");
const path = require("path");
const quick = require("../util/quick");
const util = require("../util/util");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("리플레이")
    .setDescription("리플레이 파일을 전부 다운로드합니다.")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("다운로드")
        .setDescription("리플레이 파일을 전부 다운로드합니다.")
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("프로젝트")
        .setDescription("프로젝트")
        .addStringOption((option) =>
          option
            .setName("이름")
            .setDescription("이름")
            .setRequired(true)
            .setAutocomplete(true)
        )
        .addStringOption((option) =>
          option
            .setName("동작")
            .setDescription("동작")
            .setRequired(true)
            .addChoices(
              { name: "실행", value: "실행" },
              { name: "중단", value: "중단" },
              { name: "추가", value: "추가" }
            )
        )
    ),
  async execute(interaction /*,logchannel*/) {
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

    if (interaction.options.getSubcommand() === "다운로드") {
      await download();
    } else if (interaction.options.getSubcommand() === "프로젝트") {
      await project();
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

      if (!fs.existsSync("./data/projects.json"))
        fs.writeFileSync("./data/projects.json", JSON.stringify([]));
      const name = interaction.options.getString("이름");
      const execute = interaction.options.getString("동작");
      let config = util.readFile(path.resolve("../config.json"));

      let project = util.readFile(path.resolve("../data/projects.json"));
      if (execute == "실행") {
        for (let projects of project) {
          if (projects.name == name) {
            config.project = projects.id;
            await interaction.editReply(
              `**${projects.name}** 프로젝트가 활성화되었어요.`
            );
            break;
          }
        }
      } else if (execute == "중단") {
        await interaction.editReply(`프로젝트가 중단되었어요.`);
        config.project = "";
      } else if (execute == "추가") {
        await createfolder();
      }
      fs.writeFileSync("./config.json", JSON.stringify(config));
      fs.writeFileSync("./data/projects.json", JSON.stringify(project));

      async function createfolder() {
        let readproject = fs.readFileSync("./data/projects.json", "utf8");
        for (let project of readproject) {
          if (project.name == name)
            return await interaction.editReply(
              "이미 존재하는 프로젝트에요. 이름을 바꿔서 다시 시도해 주세요."
            );
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
                  `프로젝트 **${name}**이(가) 추가되었어요. (id: "${file.data.id}")`
                );
                let readprojects = fs.readFileSync(
                  "./data/projects.json",
                  "utf8"
                );
                let pj = JSON.parse(readprojects);
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
              if (err)
                return console.error("Error retrieving access token", err);
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
          )
        )
      )
        return; //Trial member || Nanocraft SMP
      if (!fs.existsSync(config.filepath)) fs.mkdirSync(config.filepath);

      const zip = new require("node-zip")();
      let readconfig = JSON.parse(fs.readFileSync("config.json", "utf8"));

      if (readconfig.project) {
        let project = JSON.parse(
          fs.readFileSync("./data/projects.json", "utf8")
        );
        let projectname = "None";
        let projectid = "";
        for (let pj of project) {
          if (pj.id == readconfig.project) {
            projectname = pj.name;
            projectid = pj.id;
            break;
          }
        }

        let url = `https://drive.google.com/drive/folders/${projectid}?usp=sharing`;

        const embed = new Discord.EmbedBuilder()
          .setTitle(projectname)
          .setDescription(
            `[${projectname} 링크](${url})를 생성했어요.\n전체 파일 다운로드 방법:`
          )
          .setColor("#33FF99")
          .setURL(url)
          .setTimestamp()
          .setImage("https://i.imgur.com/o3oSddy.png");
        interaction.member.user
          .send({ embeds: [embed] })
          .then((msg) => {
            interaction.editReply({
              ephemeral: true,
              content: `파일을 [DM](${msg.url})으로 전송했어요!`,
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
        return;
      } else
        chokidar
          .watch(config.filepath, { ignoreInitial: false })
          .on("add", (path, event) => {
            let filename = Path.basename(path);
            zip.file(filename, fs.readFileSync(path));
          });

      await interaction.editReply({
        ephemeral: true,
        content: "파일을 압축하는 중이에요...",
      });
      var data = zip.generate({ base64: false, compression: "DEFLATE" });
      fs.writeFileSync("PCRC.zip", data, "binary");
      var stats = fs.statSync("PCRC.zip");
      var fileSizeInBytes = stats.size;
      var fileSizeInMegabytes = fileSizeInBytes / (1024 * 1024);

      await interaction.editReply({
        ephemeral: true,
        content: "파일을 업로드 중이에요...",
      });
      fs.readFile("./data/credentials.json", (err, content) => {
        if (err) return console.log("Error loading client secret file:", err);
        authorize(JSON.parse(content), storeFiles, fileSizeInMegabytes);
      });

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
