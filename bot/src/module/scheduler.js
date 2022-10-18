const fs = require("fs");
const { vote } = require("../commands/vote");

setInterval(check, 30 * 1000);

async function check() {
  const now = new Date();

  let dataFile = fs.readFileSync("../data/schedule.json", "utf8");
  /**
   * @type {Array}
   */
  let data = JSON.parse(dataFile);

  data.forEach((item, index) => {
    let time = new Date(item.date);
    if (time < now) {
      let Vote = new vote(item.vote);
      Vote.stopVote();
      console.log("A schedule finished");
    }
  });
  return;
}
