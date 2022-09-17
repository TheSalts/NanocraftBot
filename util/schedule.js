const schdule = require("node-schedule");

module.exports = {
  /**
   * @description do {todo} function when {date}
   * @type async function
   * @param {Date} date
   * @param {Function} todo
   */
  schedule: async function (date, todo) {
    await schdule.scheduledJobs(date, todo());
  },
};
