const urllibs = require('url')
const path = require('path')
const fs = require('fs')
const iconv = require('iconv-lite')
const cheerio = require('cheerio')
const asyncLibs = require('async')
const request = require('request')

const Spider = require('./Spider')
const log = console.log.bind(console)
const errlog = path.join(__dirname, 'err.log')

class NovelSpider extends Spider {
    constructor(db, webSiteId) {
        super()
        this.db = db
        this.webSiteId = webSiteId
        this.accessUrl = 'http://zhannei.baidu.com/cse/search?q=&p=0&s=11815863563564650233&entry=1'
        for (let i = 0; i < 76; i++) {
            this.urlCols.set(`http://zhannei.baidu.com/cse/search?q=&p=${i}&s=11815863563564650233&entry=1`, {})
        }
    }

    crawComplete() {
        // console.log(this.collections)
    }

    afterGetPage(items, url, callback) {
        log(`GET=>${url}`)
        asyncLibs.each(items, (item, cb) => {
            this.insertNovel([item.title, item.author, item.cover_img, item.category, item.updateAt], item.originUrl, cb)
        }, (err) => {
            log('INSERT SUCCESS')
            callback(null)
        })
    }

    afterGetPageError(err, cb) {
        log(err)
        cb()
    }

    parsePage(html) {
        let $ = cheerio.load(html)
        return $('.result-item').map((index, el) => {
            let cover_img = $(el).find('img').attr('src')
            let title = $(el).find('.result-game-item-title-link').attr('title')
            let originUrl = $(el).find('.result-game-item-title-link').attr('href')
            let author = $(el).find('.result-game-item-info-tag').eq(0).find('span').eq(1).text().replace(/(^\s*)|(\s*$)/g, '')
            let category = $(el).find('.result-game-item-info-tag').eq(1).find('span').eq(1).text()
            let updateAt = $(el).find('.result-game-item-info-tag').eq(2).find('span').eq(1).text()
            return { title, author, category, updateAt, cover_img, originUrl }
        }).get()
    }

    insertNovel(parmas, url, cb) {
        let sql = "INSERT INTO novels(name, author, cover_img, category_name, last_update) VALUES (?,?,?,?,?)"
        this.db.query(sql, parmas)
            .then(res => {
                this.insertNovelWebsite(res.insertId, url, cb)
            })
            .catch(e => {
                fs.appendFileSync(errlog, `novels ==> ${parmas[0]} : ${parmas[1]} url: ${url}\n`)
                cb(null)
            })
    }

    insertNovelWebsite(novelId, url, cb) {
        let sql = "INSERT INTO novels_websites(novels_id, websites_id, url) VALUES(?,?,?)"
        this.db.query(sql, [novelId, this.webSiteId, url])
            .then(res=> cb(null))
            .catch(e => {
                fs.appendFileSync(errlog, `novels_websites ==> ${novelId} url: ${url}\n`)
                cb(null)
            })
    }
}

module.exports = NovelSpider