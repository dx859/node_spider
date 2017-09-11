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


class ChapterSpider extends Spider {
  constructor(db, webSiteId) {
    super()
    this.db = db
    this.webSiteId = webSiteId
    this.character = 'gbk'

  }

  async crawReady() {
    let [{ origin }] = await this.db.query('SELECT origin FROM websites WHERE id=?', [this.webSiteId])
    this.origin = origin
    let urlobjs = await this.db.query('SELECT novels_id, websites_id, url FROM novels_websites')
    urlobjs.forEach(item => {
      this.urlCols.set(item.url, item)
    })
  }

  afterGetPage(items, url, callback) {
    this.insertNovelIntro(items.urlCol.novels_id, items.intro)
    asyncLibs.eachLimit(items.chapters, 10, (item, cb) => {
      this.insertChapter(items.urlCol.novels_id, items.urlCol.websites_id, item, cb)
    }, (err) => callback())
  }

  afterGetPageError(err, cb) {
    log(err)
    cb()
  }

  parsePage(html, origin) {
    origin = origin ? origin : this.origin
    let $ = cheerio.load(html, { decodeEntities: false, xmlMode: true })
    let name = $('#info h1').text()
    let author = $('#info p').eq(0).text().replace(/^.*者：/, '')
    let intro = $('#intro p').text()
    let cover_img = urllibs.resolve(origin, $('#fmimg img').attr('data-cfsrc'))

    let chapters = $('#list dd a').map((index, el) => {
      let originUrl = urllibs.resolve(origin, $(el).attr('href'))
      let title = $(el).text()
      return { title, originUrl, index }
    }).get()

    return { name, author, intro, cover_img, chapters }
  }

  insertChapter(novelId, websiteId, chapter, cb) {
    let sql = `INSERT INTO chapters(novels_id, websites_id, title, chapter_index, origin_url) VALUES (?,?,?,?,?)`
    this.db.query(sql, [novelId, websiteId, chapter.title, chapter.index, chapter.originUrl])
      .then(res => {
        cb(null)
      })
      .catch(e => {
        cb(null)
        fs.appendFileSync(errlog, `chapters ==> ${chapter.title} ${chapter.originUrl}\n`)
      })

  }

  insertNovelIntro(novels_id, intro, cb) {
    let sql = `UPDATE novels SET intro=? WHERE id=?`
    this.db.query(sql, [intro, novels_id])
      .then(res => {
        cb(null)
      })
      .catch(e => {
        cb(null)
      })
  }

}

module.exports = ChapterSpider