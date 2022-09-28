const config = require("../config.json");
const { Client } = require("@notionhq/client");

module.exports = {
  /**
   * @description Upload data to notion database
   */
  upload: async function ({ name, value }) {
    const notion = new Client({ auth: config.notionDataApiKey });
    const databaseId = "7c508cc3be0640d2a1a185ff61a6120f";
    await notion.pages.create({
      parent: {
        type: "database_id",
        database_id: databaseId,
      },
      properties: {
        name: {
          title: [
            {
              text: {
                content: `${name}`,
              },
            },
          ],
        },
        value: {
          rich_text: [
            {
              text: {
                content: `${value}`,
              },
            },
          ],
        },
      },
    });
  },
  /**
   * @description Get data from notion database
   * @param {string} param0
   */
  get: async function ({ name, value }) {
    const notion = new Client({ auth: config.notionDataApiKey });
    const databaseId = "7c508cc3be0640d2a1a185ff61a6120f";
    const response = await notion.databases.query({
      database_id: databaseId,
    });
    for (let res of response.results) {
      let data = res.properties;
      let dataName = data.name.title[0].plain_text.replaceAll("”", `"`);
      let dataValue = data.value.title[0].plain_text.replaceAll("”", `"`);

      let dataArray = [];

      if (dataName === name || dataValue === value) {
        dataArray.push({
          name: dataName,
          value: dataValue,
        });
      }
      return dataArray;
    }
  },
};
