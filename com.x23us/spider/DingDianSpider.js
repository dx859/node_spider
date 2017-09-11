const urlLib = require('url');
const dbtool = require('../../libs/db');
const {db} = require('./../config');
const Spider = require('./../libs/Spider');
const {md5} = require('../../utils/common');
const MysqlPipeline = require('./../pipeline/MysqlPileline');
const ImagePileline= require('../pipeline/ImagePileline');

class DingDianSpider extends Spider {

    constructor() {
        super();
        this.charset = 'gbk';
        this.urls.set('http://www.x23us.com/html/54/54076/', {fn: this.parse});
        this.imagePipeline = new ImagePileline();
        this.mysqlPipeline = new MysqlPipeline();
        this.pipelines.push(this.imagePipeline);
        this.pipelines.push(this.mysqlPipeline);
        this.close = this.mysqlPipeline.close.bind(this.mysqlPipeline);
    }

    async init() {
        dbtool.configure({
            host: db.host,
            user: db.user,
            port: db.port,
            password: db.password,
            database: db.database
        });
        let urls = await dbtool.query('SELECT url FROM dd_chapters');

        dbtool.end();
        urls = urls.map(url => md5(url.url));

        this.mysqlPipeline.setChapterUrls(urls);

    }

    parse(response) {
        console.log(`running=>${this.running}: pip=>${this.pipeNums}: size=>${this.urls.size}`);
        let url = response.url;
        let name = response.cheerio('meta[name="og:novel:book_name"]').attr('content');
        let author = response.cheerio('meta[name="og:novel:author"]').attr('content');
        let intro = response.cheerio('meta[property="og:description"]').attr('content').trim();
        let image_url = response.cheerio('meta[property="og:image"]').attr('content');
        image_url = urlLib.resolve(url, image_url);
        let category_name = response.cheerio('meta[name="og:novel:category"]').attr('content');
        let status = response.cheerio('meta[name="og:novel:status"]').attr('content');
        let update_at = response.cheerio('meta[name="og:novel:update_time"]').attr('content');
        response.cheerio('.hot a').map((i, a) => {
            let href = response.cheerio(a).attr('href');
            this.add(href, {fn: this.parse});
        });


        let chapters = response.cheerio('#a_main table td a').map((index, el) => {
            let href = response.cheerio(el).attr('href');
            let name = response.cheerio(el).text();
            href = urlLib.resolve(url, href);
            return {name, href, index};
        }).get();

        this.startPipeline({url, name, author, intro, image_url, category_name, status, update_at, chapters})

    }
}

module.exports = DingDianSpider;

if (module.parent === null) {
    let dingdian = new DingDianSpider();
    dingdian.start();
}