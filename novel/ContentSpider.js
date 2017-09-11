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
    constructor(db, limit=1000) {
        super()
        this.db = db
        this.character = 'gbk'
        this.limit = limit
    }

    async crawReady() {
        let chapters = await this.db.query('SELECT id, origin_url FROM chapters WHERE is_spider=0 LIMIT ?', [this.limit])
        chapters.forEach(item => {
            this.urlCols.set(item.origin_url, item.id)
        })

    }

    afterGetPage(item, url, callback) {
        log(`GET=>${item.urlCol}`)
        this.insertContent(item.urlCol, item.content)
            .then(res=>{
                callback(null)
            })
            .catch(e=>{
                log(e)
                callback(null)
            })
    }

    afterGetPageError(err, cb) {
        log(err)
        cb()
    }

    parsePage(html) {
        let $ = cheerio.load(html, { decodeEntities: false, xmlMode: true })
        let content = $('#content').html().replace(/(^\s*)|(\s*$)/g, '').replace(/<br\/>/g, '').replace(/&nbsp;/g, ' ')
        return { content }
    }

    insertContent(chapters_id, content) {
        return new Promise((resolve, reject) => {
            this.db.conn.beginTransaction(err => {
                if (err) return reject(err)
                let sql = `INSERT INTO contents (content, chapters_id) VALUES (?,?)`
                this.db.conn.query(sql, [content, chapters_id], (err, res) => {
                    if (err) {
                        reject(err)
                    } else {
                        this.db.conn.query('UPDATE chapters SET is_spider=1 WHERE id=?', [chapters_id], (err, res) => {
                            if (err) {
                                return this.db.conn.rollback(() => reject(err))
                            }
                            this.db.conn.commit(err => {
                                if (err) {
                                    return this.db.conn.rollback(() => reject(err))
                                }
                                resolve(res)
                            })
                        })
                    }
                })

            })
        })
    }


}

module.exports = NovelSpider