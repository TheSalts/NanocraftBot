const config = require("../data/youtubeconfig.json"),
  Parser = require("rss-parser"),
  parser = new Parser(),
  Youtube = require("simple-youtube-api"),
  youtube = new Youtube(config.youtubeKey),
  axios = require("axios");
const startAt = Date.now();
const lastVideos = {};
const fs = require("fs");
const util = require("../util/util");
const { Client, GatewayIntentBits, Partials } = require("discord.js");
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
  partials: [Partials.Channel, Partials.Message],
});
const _config = require("../config.json");

client.login(_config.token).catch(console.log);

client.on("ready", () => {
  console.log(`youtube notification ready`);
  /**
   * Check for new videos
   */
  async function check() {
    console.log("Checking...");
    config.youtubers.forEach(async (youtuber) => {
      console.log(
        `[${
          youtuber.url.length >= 10
            ? youtuber.url.slice(0, 10) + "..."
            : youtuber.url
        }] | Start checking...`
      );
      let channelInfos = await getYoutubeChannelInfos(youtuber.url);
      if (!channelInfos)
        return console.log(
          "[ERR] | Invalid youtuber provided: " + youtuber.url
        );
      if (youtuber.tag) {
        let Tag = checkTag(youtuber.tag);
        if (!Tag)
          return console.log(
            `[${channelInfos.raw.snippet.title}] | No notification`
          );
      }
      let video = await checkVideos(
        channelInfos.raw.snippet.title,
        "https://www.youtube.com/feeds/videos.xml?channel_id=" + channelInfos.id
      );
      if (!video)
        return console.log(
          `[${channelInfos.raw.snippet.title}] | No notification`
        );
      let channel = client.channels.cache.get(config.streamingChannel);
      if (!channel) return console.log("[ERR] | Channel not found");
      let data = util.readFile("../data/youtube.json");
      let live = await checkStreaming(video.id);
      switch (live.status) {
        case "liveEnd":
          data.forEach((item, index) => {
            if (item.status === "live" && item.videoId === live.videoId) {
              let msg = channel.messages.fetch(item.msgid);
              msg.delete();
              data.splice(index, 1);
            } else if (item.videoId === live.videoId) {
              let msg = channel.messages.fetch(item.msgid);
              msg.delete();
              data.splice(index, 1);
            }
          });
          break;
        case "upcoming":
          data.forEach((item, index) => {
            if (item.videoId === live.videoId) {
              let msg = channel.messages.fetch(item.msgid);
              msg.delete();
              data.splice(index, 1);
            }
          });
          break;
        case "live":
          data.forEach((item, index) => {
            if (item.status === "upcoming" && item.videoId === live.videoId) {
              let msg = channel.messages.fetch(item.msgid);
              msg.delete();
              data.splice(index, 1);
            } else if (item.videoId === live.videoId) {
              let msg = channel.messages.fetch(item.msgid);
              msg.delete();
              data.splice(index, 1);
            }
          });
          break;
        default:
          channel = client.channels.cache.get(config.channel);
          break;
      }
      fs.writeFileSync("../data/youtube.json", JSON.stringify(data));

      await channel.send({
        content: config.message
          .replace("{videoURL}", video.link)
          .replace("{videoAuthorName}", video.author)
          .replace("{videoTitle}", video.title)
          .replace("{videoPubDate}", formatDate(new Date(video.pubDate))),
      });

      console.log("Notification sent !");
      lastVideos[channelInfos.raw.snippet.title] = video;
    });
  }
  check();
  setInterval(check, 20 * 1000);
});

/**
 * Format a date to a readable string
 * @param {Date} date The date to format
 */
function formatDate(date) {
  let monthNames = [
    "1월",
    "2월",
    "3월",
    "4월",
    "5월",
    "6월",
    "7월",
    "8월",
    "9월",
    "10월",
    "11월",
    "12월",
  ];
  let day = date.getDate(),
    month = date.getMonth(),
    year = date.getFullYear();
  return `${day} ${monthNames[parseInt(month, 10)]} ${year}`;
}

/**
 * Call a rss url to get the last video of a youtuber
 * @param {string} youtubeChannelName The name of the youtube channel
 * @param {string} rssURL The rss url to call to get the videos of the youtuber
 * @returns The last video of the youtuber
 */
async function getLastVideo(youtubeChannelName, rssURL) {
  console.log(`[${youtubeChannelName}]  | Getting videos...`);
  let content = await parser.parseURL(rssURL);
  console.log(
    `[${youtubeChannelName}]  | ${content.items.length} videos found`
  );
  let tLastVideos = content.items.sort((a, b) => {
    let aPubDate = new Date(a.pubDate || 0).getTime();
    let bPubDate = new Date(b.pubDate || 0).getTime();
    return bPubDate - aPubDate;
  });
  console.log(
    `[${youtubeChannelName}]  | The last video is "${
      tLastVideos[0] ? tLastVideos[0].title : "err"
    }"`
  );
  return tLastVideos[0];
}

/**
 * Check if there is a new video from the youtube channel
 * @param {string} youtubeChannelName The name of the youtube channel to check
 * @param {string} rssURL The rss url to call to get the videos of the youtuber
 * @returns The video || null
 */
async function checkVideos(youtubeChannelName, rssURL) {
  console.log(`[${youtubeChannelName}] | Get the last video..`);
  let lastVideo = await getLastVideo(youtubeChannelName, rssURL);
  // If there isn't any video in the youtube channel, return
  if (!lastVideo) return console.log("[ERR] | No video found for " + lastVideo);
  // If the date of the last uploaded video is older than the date of the bot starts, return
  if (new Date(lastVideo.pubDate).getTime() < startAt)
    return console.log(
      `[${youtubeChannelName}] | Last video was uploaded before the bot starts`
    );
  let lastSavedVideo = lastVideos[youtubeChannelName];
  // If the last video is the same as the last saved, return
  if (lastSavedVideo && lastSavedVideo.id === lastVideo.id)
    return console.log(
      `[${youtubeChannelName}] | Last video is the same as the last saved`
    );
  return lastVideo;
}

/**
 * Get the youtube channel id from an url
 * @param {string} url The URL of the youtube channel
 * @returns The channel ID || null
 */
function getYoutubeChannelIdFromURL(url) {
  let id = null;
  url = url.replace(/(>|<)/gi, "").split(/(\/channel\/|\/user\/)/);
  if (url[2]) {
    id = url[2].split(/[^0-9a-z_-]/i)[0];
  }
  return id;
}

/**
 * Get infos for a youtube channel
 * @param {string} name The name of the youtube channel or an url
 * @returns The channel info || null
 */
async function getYoutubeChannelInfos(name) {
  console.log(
    `[${
      name.length >= 10 ? name.slice(0, 10) + "..." : name
    }] | Resolving channel infos...`
  );
  let channel = null;
  /* Try to search by ID */
  let id = getYoutubeChannelIdFromURL(name);
  if (id) {
    channel = await youtube.getChannelByID(id);
  }
  if (!channel) {
    /* Try to search by name */
    let channels = await youtube.searchChannels(name);
    if (channels.length > 0) {
      channel = channels[0];
    }
  }
  console.log(
    `[${
      name.length >= 10 ? name.slice(0, 10) + "..." : name
    }] | Title of the resolved channel: ${
      channel.raw ? channel.raw.snippet.title : "err"
    }`
  );
  return channel;
}

async function checkStreaming(videoId) {
  /**
   * @type {Array<object>}
   */
  let data = util.readFile("../data/youtube.json");

  let videoInfo = await axios.get(
    `https://www.googleapis.com/youtube/v3/videos?part=id,liveStreamingDetails,snippet&id=${videoId}&key=${config.youtubeKey}`
  );
  let videoStream = videoInfo.items[0]?.snippet?.liveBroadcastContent;
  let videoStreamDetail = videoInfo.items[0]?.liveStreamingDetails;
  switch (videoStream) {
    case "none":
      if (videoStreamDetail)
        videoInfo = { status: "liveEnd", videoId: videoId };
      videoInfo = { status: "notLive", videoId: videoId };
      break;
    case "upcoming":
      let upcoming = data.find(
        (item) => item.status === "upcoming" && item.videoId === videoId
      );
      let upcomingvideo = {
        status: "upcoming",
        start: videoStreamDetail.scheduledStartTime,
        end: videoStreamDetail.scheduledEndTime,
        videoId: videoId,
      };
      if (!upcoming) data.push(upcomingvideo);
      videoInfo = upcomingvideo;
      break;
    case "live":
      let live = data.find(
        (item) => item.status === "live" && item.videoId === videoId
      );
      let livevideo = {
        status: "live",
        liveStreamingDetails: videoStreamDetail,
        videoId: videoId,
      };
      if (!live) data.push(livevideo);
      videoInfo = livevideo;
      break;
  }
  return videoInfo;
}

async function checkTag(videoId, tag) {
  let videoInfo = await axios.get(
    `https://www.googleapis.com/youtube/v3/videos?part=id,liveStreamingDetails,snippet&id=${videoId}&key=${config.youtubeKey}`
  );
  let regex = new RegExp(tag, "imu");
  let videotag = videoInfo.items[0]?.snippet?.description.match(regex);
  if (videotag) return videotag;
  else return false;
}
