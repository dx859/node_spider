const urlLib = require('url')
const dbtool = require('../../libs/db')
const {db} = require('./../config');
const Spider = require('../libs/Spider')
const {md5} = require('../../utils/common');
const MysqlPipeline = require('../pipeline/MysqlPileline');
const ImagePileline= require('../pipeline/ImagePileline');


class NovelSpider extends Spider {

    constructor() {
        super()
        this.charset = 'gbk'
        //http://www.biquzi.com/1_1999/
        // http://www.biquzi.com/12_12927/
        this.urls.set('http://www.biquzi.com/0_1/', {fn: this.parse})
        this.imagePipeline = new ImagePileline()
        this.mysqlPipeline = new MysqlPipeline()

        this.pipelines.push(this.imagePipeline)
        this.pipelines.push(this.mysqlPipeline)

        this.close = this.mysqlPipeline.close.bind(this.mysqlPipeline)
        this.maxNum = Number.MAX_VALUE
    }

    async init() {
        dbtool.configure({
            host: db.host,
            user: db.user,
            port: db.port,
            password: db.password,
            database: db.database
        })

        let urls = await dbtool.query('SELECT url FROM dd_chapters')
        let oldUrls = await dbtool.query('SELECT url FROM dd_novels')
        dbtool.end()
        urls = urls.map(url => md5(url.url))
        this.oldUrls = new Set(oldUrls.map(url => url.url))

        this.mysqlPipeline.setChapterUrls(urls)
    }

    parse(response) {
        console.log(`running=>${this.running}: pip=>${this.pipeNums}: size=>${this.urls.size}`);

        let url = response.url
        let name = response.cheerio('meta[property="og:novel:book_name"]').attr('content');
        let author = response.cheerio('meta[property="og:novel:author"]').attr('content');
        let intro = response.cheerio('meta[property="og:description"]').attr('content').trim();
        let image_url = response.cheerio('meta[property="og:image"]').attr('content');
        image_url = urlLib.resolve(url, image_url);
        let category_name = response.cheerio('meta[property="og:novel:category"]').attr('content');
        let status = response.cheerio('meta[property="og:novel:status"]').attr('content');
        let update_at = response.cheerio('meta[property="og:novel:update_time"]').attr('content');
        let latest_chapter_name = response.cheerio('meta[property="og:novel:latest_chapter_name"]').attr('content')
        let latest_chapter_url = response.cheerio('meta[property="og:novel:latest_chapter_url"]').attr('content')
        response.cheerio('.footer_link a').map((i, a) => {
            let href = response.cheerio(a).attr('href');
            href = urlLib.resolve(url, href)
            // return href
            this.add(href, {fn: this.parse});
        }).get()

        let chapters = response.cheerio('#list a').map((index, el) => {
            let href = response.cheerio(el).attr('href');
            let name = response.cheerio(el).text();
            href = urlLib.resolve(url, href);
            return {name, href, index};
        }).get();

        this.startPipeline({url, name, author, intro, image_url, category_name, status, update_at, latest_chapter_name, latest_chapter_url, chapters})

    }

}

module.exports = NovelSpider;

if (module.parent === null) main();

async function main() {
    let novelSpider = new NovelSpider();
    await novelSpider.init()
    novelSpider.start();
}