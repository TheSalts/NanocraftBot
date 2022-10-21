const fs = require("fs");
const { vote } = require("../commands/vote");

setInterval(check, 30 * 1000);

async function check() {
  let now = new Date().getTime();

  let dataFile = fs.readFileSync("../data/schedule.json", "utf8");
  /**
   * @type {Array}
   */
  let data = JSON.parse(dataFile);

  data.forEach((item, index) => {
    let time = new Date(item.date).getTime();
    if (time < now) {
      let Vote = new vote(item.vote);
      Vote.stopVote();
      console.log("A schedule finished");
      data.splice(index, 1);
    }
  });
  fs.writeFileSync("../data/schedule.json", JSON.stringify(data));
  return;
}
