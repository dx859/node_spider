/**
 * Created by daixi on 2017/9/11.
 */
const Spider = require('./../libs/Spider');
const dbtool = require('../../libs/db');
const {db} = require('./../config');
const MysqlContentPipeline = require('../pipeline/MysqlContentPipeline');

class ContentSpider extends Spider {
    constructor() {
        super();
        this.charset = 'gbk';
        this.mysqlContentPipeline = new MysqlContentPipeline();
        this.pipelines.push(this.mysqlContentPipeline);
        this.close = this.mysqlContentPipeline.close.bind(this.mysqlContentPipeline);
    }

    async init() {
        dbtool.configure({
            host: db.host,
            user: db.user,
            port: db.port,
            password: db.password,
            database: db.database
        });
        let sql = `
            SELECT c.id, c.url FROM dd_chapters c
                LEFT JOIN dd_contents n ON c.id = n.chapters_id
                WHERE n.chapters_id IS NULL
                LIMIT 10000`;
        let urls = await dbtool.query(sql);
        dbtool.end();
        urls = urls.map(url => {
            return [url.url, {fn: this.parse, meta: {chapter_id: url.id}}]
        });
        this.urls = new Map(urls);

    }

    parse(response) {
        let chapter_id = response.meta.chapter_id;
        let content = response.cheerio('#contents').html().trim().replace(/&nbsp;/g, ' ').replace(/<br><br>/g, '\n' ).replace(/<br>/g, '\n');

        this.startPipeline({content, chapter_id});
    }
}

module.exports = ContentSpider;
if (module.parent === null) main();

async function main() {
    let content = new ContentSpider();
    await content.init();
    content.start();
}