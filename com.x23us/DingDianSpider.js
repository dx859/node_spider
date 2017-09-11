const urlLib = require('url');
const Spider = require('./libs/Spider');
const MysqlPipeline = require('./pipeline/MysqlPileline');

class DingDianSpider extends Spider {

    constructor() {
        super();
        this.charset = 'gbk';
        this.urls.set('http://www.x23us.com/html/54/54076/', {fn: this.parse});

        this.pipelines.push(new MysqlPipeline());

    }

    parse(response) {
        let url = response.url;
        let name = response.cheerio('meta[name="og:novel:book_name"]').attr('content');
        let author = response.cheerio('meta[name="og:novel:author"]').attr('content');
        let intro = response.cheerio('meta[property="og:description"]').attr('content').trim();
        let image_url = response.cheerio('meta[property="og:image"]').attr('content');
        image_url = urlLib.resolve(url, image_url);
        let category_name = response.cheerio('meta[name="og:novel:category"]').attr('content');
        let status = response.cheerio('meta[name="og:novel:status"]').attr('content');
        let update_at = response.cheerio('meta[name="og:novel:update_time"]').attr('content');

        let chapters = response.cheerio('#a_main table td a').map((i, el) => {
            let href = response.cheerio(el).attr('href');
            let name = response.cheerio(el).text();
            href = urlLib.resolve(url, href);
            return {name, href};
        }).get();

        this.startPipeline({url, name, author, intro, image_url, category_name, status, update_at, chapters})

    }
}

module.exports = DingDianSpider;

if (module.parent === null) {
    let dingdian = new DingDianSpider();
    dingdian.start();
}