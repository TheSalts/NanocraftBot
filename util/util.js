const schedule = require("node-cron");
const fs = require("fs");

module.exports = {
  /**
   * @param {Date} date
   * @param {Function} callback
   * @param  {...any} args
   */
  schedule: async function (date, callback, ...args) {
    function dateToCron(date) {
      const minutes = date.getMinutes();
      const hours = date.getHours();
      const days = date.getDate();
      const months = date.getMonth() + 1;
      const dayOfWeek = date.getDay();
      return `${minutes} ${hours} ${days} ${months} ${dayOfWeek}`;
    }
    schedule.schedule(dateToCron(date), await callback(args));
  },
  /**
   * @description read file and if file does not exist, write file
   * @param {NodeJS.RequireResolve} path 파일 위치
   * @returns
   */
  readFile: function (path) {
    if (typeof path !== "string")
      throw new Error(`Path must be string, not ${typeof path}`);
    if (!fs.existsSync(path)) fs.writeFileSync(path, JSON.stringify([]));
    let read = fs.readFileSync(path, "utf8");
    return JSON.parse(read);
  },
};
