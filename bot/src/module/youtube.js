const Parser = require("rss-parser")
const parser = new Parser()
async function t() {
    let d = await parser.parseURL("https://www.youtube.com/feeds/videos.xml?channel_id=UCvm3oVvmLx1HNPUWT7R5v2A")
    console.log(d)
}
t()