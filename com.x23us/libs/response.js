/**
 * Created by daixi on 2017/9/10.
 */
const cheerio = require('cheerio');
const htmlparser2 = require('htmlparser2');

class response {
    constructor(html, url) {
        this.body = html;
        this.url = url;
        this.cheerio = cheerio.load(htmlparser2.parseDOM(html));
    }
}

module.exports = response;