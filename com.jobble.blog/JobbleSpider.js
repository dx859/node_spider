/**
 * Created by daixi on 2017/9/10.
 */
const urlLib = require('url');
const request = require('request');
const { log } = require('../utils/common');
const Response = require('./response');
const ImagePipeline = require('./pipeline/ImagePileline');
const MysqlPipeline = require('./pipeline/MysqlPileline');

class JobbleSpider {
    constructor() {
        this.start_urls = ['http://blog.jobbole.com/all-posts/'];
        this.running = 0;
        this.limit = 5;
        this.parse = this.parse.bind(this);
        this.parseDetail = this.parseDetail.bind(this);

        this.urls = new Map(this.start_urls.map(url => [url, { fn: this.parse }]));
        this.oldUrls = new Set();
        this.failedUrls = new Set();
        this.imagePipeline = new ImagePipeline();
        this.mysqlPipeline = new MysqlPipeline();
        this.pipelines = [];
        this.pipelines.push(this.imagePipeline);
        this.pipelines.push(this.mysqlPipeline);

        this.pipeNums = 0;
        this.isClose = false;
        this.close = this.mysqlPipeline.close.bind(this.mysqlPipeline);

    }

    start() {
        while (this.running < this.limit && this.urls.size > 0) {
            let url = this.urls.keys().next().value;
            let item = this.urls.get(url);
            this.del(url);
            let startTime = Date.now();
            request({ uri: url, timeout: 10000 }, (err, response, body) => {
                let endTime = Date.now();
                log.log(`GET=>${url}: ${endTime-startTime}ms`)
                this.running--;
                if (err) {
                    log.error(`${url}=>${err}`);
                    this.failedUrls.add(url);
                } else if (response.statusCode !== 200) {
                    log.error(`${url}=>statusCode=${response.statusCode}`);
                    this.failedUrls.add(url);
                } else {
                    this.oldUrls.add(url);
                    let res = new Response(body, url);
                    res.meta = item.meta;
                    item.fn(res);
                }

                if (this.urls.size > 0) {
                    this.start();
                } else if (this.running === 0) {
                    let timer = setInterval(() => {
                        if (this.pipeNums === 0) {
                            this.closePipeline();
                            clearInterval(timer);
                        }
                    }, 1000);
                }

            });
            this.running++;
        }

    }

    async startPipeline(item) {
        this.pipeNums++;
        for (let i = 0; i < this.pipelines.length; i++) {
            try {
                item = await this.pipelines[i].process_item(item);
            } catch (e) {
                log.error(`URL=>${item.url}: PipelineCode=>${i}: ERROR=>${e}`);
            }

        }
        this.pipeNums--;
    }

    parse(response) {
        let nodes = response.cheerio('#archive .post-thumb a');
        nodes.each((i, el) => {
            let baseUrl = response.url;
            let postUrl = response.cheerio(el).attr('href');
            let imgUrl = response.cheerio(el).find('img').attr('src');
            postUrl = urlLib.resolve(baseUrl, postUrl);
            imgUrl = urlLib.resolve(baseUrl, imgUrl);
            this.add(postUrl, { fn: this.parseDetail, meta: { imgUrl } })
        });

        let new_url = response.cheerio('.next.page-numbers').attr('href');
        if (new_url) {
            this.urls.set(new_url, { fn: this.parse });
        }
    }

    parseDetail(response) {
        let title = response.cheerio('.entry-header h1').text();
        let front_img_url = response.meta.imgUrl;
        let url = response.url;
        let create_at = response.cheerio('.entry-meta-hide-on-mobile').text()
            .replace(/[\s\S]*(\d{4})\/(\d{2})\/(\d{2})[\s\S]*/, '$1-$2-$3');
        let praise_nums = response.cheerio('.vote-post-up h10').text() * 1;
        let fav_nums = response.cheerio('.bookmark-btn').text()
        fav_nums = fav_nums.match(/.*?(\d+).*/);
        fav_nums = fav_nums === null ? 0 : fav_nums[1] * 1;
        let comment_nums = response.cheerio('a[href="#article-comment"] span').text()
        comment_nums = comment_nums.match(/.*?(\d+).*/);
        comment_nums = comment_nums === null ? 0 : comment_nums[1] * 1;
        let content = response.cheerio('div.entry').html().trim();
        let breadcrumb = response.cheerio('.entry-meta-hide-on-mobile a')
        let category = breadcrumb.filter((i, el) => /category/.test(response.cheerio(el).attr('href'))).text();
        let tags = breadcrumb
            .filter((i, el) => /tag/.test(response.cheerio(el).attr('href')))
            .map((i, el) => response.cheerio(el).text())
            .get().join(',');
        // log.log(title)
        this.startPipeline({ title, url, front_img_url, create_at, praise_nums, fav_nums, comment_nums, content, category, tags });
    }

    closePipeline() {
        if (this.isClose) return;
        this.close();
        this.isClose = true;
    }

    add(url, obj) {
        if (this.oldUrls.has(url) || this.failedUrls.has(url) || this.urls.has(url)) return;
        this.urls.set(url, obj);
    }

    del(url) {
        this.urls.delete(url);
    }


}

module.exports = JobbleSpider;

if (module.parent === null) {
    let jobble = new JobbleSpider();
    jobble.start();
}