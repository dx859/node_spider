const urlLib = require('url');
const request = require('request');
const iconv = require('iconv-lite')
const Response = require('./response');
const conf = require('../config');

class Spider {
    constructor() {
        this.charset = 'utf8';
        this.running = 0;
        this.limit = conf.limit ? conf.limit : 5;
        this.pipeNums = 0;
        this.isClose = false;
        this.maxNum = 10000;
        this.num = 0;
        this.close = function() {};

        this.parse = this.parse.bind(this);
        this.urls = new Map();
        this.oldUrls = new Set();
        this.failedUrls = new Set();
        this.pipelines = [];

    }

    start() {
        while (this.running < this.limit && this.urls.size > 0 && this.maxNum >= this.num) {
            let url = this.urls.keys().next().value;
            let item = this.urls.get(url);
            this.del(url);
            let startTime = Date.now();
            request({ uri: url, timeout: 10000 , encoding: null }, (err, response, body) => {
                this.num ++;
                let endTime = Date.now();
                console.log(`GET=>${url}: ${endTime-startTime}ms`)
                this.running--;
                if (err) {
                    console.error(`${url}: ${err}`);
                } else if (response.statusCode !== 200) {
                    console.error(`${url}: statusCode=${response.statusCode}`);
                    this.failedUrls.add(url);
                } else {
                    this.oldUrls.add(url);
                    let res = new Response(iconv.decode(body, this.charset), url);
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
        if (this.pipelines.length === 0) return;
        this.pipeNums++;
        for (let i = 0; i < this.pipelines.length; i++) {
            try {
                item = await this.pipelines[i].process_item(item);
            } catch (e) {
                console.error(`${item.url}: PipelineCode=>${i}: ERROR=>${e}`);
            }

        }
        this.pipeNums--;
    }

    parse(response) {

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

module.exports = Spider;
