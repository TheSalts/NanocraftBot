const config = require("../config.json");
const { Client } = require("@notionhq/client");

module.exports = {
  /**
   *
   * @param {{ type: string, name: string, value: string }} param1
   * @returns {Promise<object>}
   */
  upload: async function ({ type, name, value }) {
    const notion = new Client({ auth: config.notionDataApiKey });
    const databaseId = "7c508cc3be0640d2a1a185ff61a6120f";
    const response = await notion.pages.create({
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
        type: {
          select: {
            name: `${type}`,
          },
        },
      },
    });
    return response;
  },
  /**
   *
   * @param {{id?: string, findName: string, findValue: string, findType: string}} param0 this field is required
   * @param { { editName?: string, editValue?: string, editType?: string }} param1
   * @returns {Promise<object|false|undefined>}
   */
  edit: async function (
    { id, findName, findValue, findType },
    { editName, editValue, editType }
  ) {
    if (!id && !(findName && findValue && findType)) return false;
    if (!editName && !editValue && !editType) return false;
    const notion = new Client({ auth: config.notionDataApiKey });
    let pageid;
    if (!id) {
      let getPage = this.get(findType, { name: findName, value: findValue });
      if (getPage.length > 1) console.log("page is more than one\n" + getPage);
      pageid = getPage[0].id;
    } else pageid = id;

    let option = {
      page_id: pageid,
    };
    if (editName)
      option.properties.name = {
        title: [
          {
            text: {
              content: `${editName}`,
            },
          },
        ],
      };
    if (editValue)
      option.properties.value = {
        rich_text: [
          {
            text: {
              content: `${editValue}`,
            },
          },
        ],
      };
    if (editType)
      option.properties.type = {
        select: {
          name: `${editType}`,
        },
      };
    let response = await notion.pages.update(option);
    return response;
  },
  /**
   * @description Get data from notion database
   * @param {{type: string, name: string, value: string}} param0
   * @returns {Promise<[{name: string, value: string, type: string, createdTime: Date, id: string}]>}
   */
  get: async function ({ type, name, value }) {
    const notion = new Client({ auth: config.notionDataApiKey });
    const databaseId = "7c508cc3be0640d2a1a185ff61a6120f";
    let option = {
      database_id: databaseId,
    };
    if (type || name || value) {
      option.filter = { and: [] };
      if (type)
        option.filter.and.push({
          property: "type",
          select: {
            equals: type,
          },
        });
      if (name)
        option.filter.and.push({
          property: "name",
          rich_text: {
            contains: name,
          },
        });
      if (value)
        option.filter.and.push({
          property: "value",
          rich_text: {
            contains: value,
          },
        });
    }
    const response = await notion.databases.query(option);
    let dataArray = [];
    for (let res of response.results) {
      let data = res.properties;
      let dataName = data.name.title[0].plain_text.replaceAll("”", `"`);
      let dataValue = data.value.rich_text[0].plain_text.replaceAll("”", `"`);
      let dataType = data.type.select.name;
      let createdTime = data.createdTime.created_time;

      if (type && dataType !== type) continue;
      if (name && dataName !== name) continue;
      if (value && dataValue !== value) continue;
      dataArray.push({
        name: dataName,
        value: dataValue,
        type: dataType,
        createdTime: new Date(createdTime),
        id: res.id,
      });
    }
    return dataArray;
  },
  /**
   * @description Get all data from notion database
   * @returns {Promise<[{name: string, value: string, type: string, createdTime: Date, id: string}]>}
   */
  getAll: async function () {
    const notion = new Client({ auth: config.notionDataApiKey });
    const databaseId = "7c508cc3be0640d2a1a185ff61a6120f";
    const response = await notion.databases.query({
      database_id: databaseId,
    });
    let dataArray = [];
    for (let res of response.results) {
      let data = res.properties;
      let dataName = data.name.title[0].plain_text.replaceAll("”", `"`);
      let dataValue = data.value.rich_text[0].plain_text.replaceAll("”", `"`);
      let dataType = data.type.select.name;
      let createdTime = data.createdTime.created_time;

      dataArray.push({
        name: dataName,
        value: dataValue,
        type: dataType,
        createdTime: new Date(createdTime),
        id: res.id,
      });
    }
    return dataArray;
  },
};
