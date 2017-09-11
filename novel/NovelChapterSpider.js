const urllibs = require('url')
const cheerio = require('cheerio')
const asyncLibs = require('async')
const ChapterSpider = require('./ChapterSpider')

class NovelChapterSpider extends ChapterSpider {
  constructor(db, webSiteId, accessUrl) {
    super(db, webSiteId)
    this.accessUrl = accessUrl
    this.urlCols = new Set()
    this.urlAlreadyCols = new Set()
    this.novels = new Map()
  }

  async crawReady() {
    let [{ origin }] = await this.db.query('SELECT origin FROM websites WHERE id=?', [this.webSiteId])
    let novels = await this.db.query('SELECT novels_id, url FROM novels_websites WHERE websites_id=?', [this.webSiteId])
    this.novels = new Map(novels.map(x => [x.url, x.novels_id]))

    this.origin = origin
    this.urlCols.add(this.accessUrl)
  }

  async spiderUrls(limit = 1) {
    await this.crawReady()

    while (this.urlCols.size > 0 && this.urlAlreadyCols.size <= 100) {
      await this.asyncGetPages(limit, this.novelUrls)
    }

    await this.crawComplete()
  }

  asyncGetPages(limit = 1, urls) {
    urls = urls ? urls : this.urlCols
    let arrs = []
    let i = 0;
    for (let item of urls.keys()) {
      if (i > 100) break;
      arrs.push(item)
      i++
    }
    return new Promise((resolve, reject) => {
      asyncLibs.eachLimit(arrs, limit, (url, cb) => {
        this.asyncGetPage(url, this.character)
          .then(html => {
            let item = this.parsePage(html)
            this.collections.set(url, item)
            urls.delete(url)
            this.urlAlreadyCols.add(url)
            this.afterGetPage(item, url, cb)
          })
          .catch(e => {
            this.afterGetPageError(e, cb)

          })
      }, (err) => {
        resolve()
      })
    })
  }

  afterGetPage(items, url, cb) {
    items.novels.forEach(x => {
      if (!this.urlAlreadyCols.has(x))
        this.urlCols.add(x)
    })

    if (!this.novels.has(url)) {
      this.insertNovel([item.name, item.author, item.cover_img, item.category_name, item.updateAt], url, cb, (id, cb) => {
        this.novels.set(url, id)
        // insertChapters
        cb(null)
      })
    } else {
      cb(null)
    }

  }

  parsePage(html, origin) {
    origin = origin ? origin : this.origin
    let $ = cheerio.load(html, { decodeEntities: false, xmlMode: true })

    let category_name = $('meta[property="og:novel:category"]').attr('content')
    let updateAt = $('meta[property="og:novel:update_time"]').attr('content')
    let name = $('#info h1').text()
    let author = $('#info p').eq(0).text().replace(/^.*者：/, '')
    let intro = $('#intro p').text()
    let cover_img = urllibs.resolve(origin, $('#fmimg img').attr('data-cfsrc'))

    let novels = $('.footer_link a').map((index, el) => {
      return urllibs.resolve(origin, $(el).attr('href'))
    }).get()

    let chapters = $('#list dd a').map((index, el) => {
      let originUrl = urllibs.resolve(origin, $(el).attr('href'))
      let title = $(el).text()
      return { title, originUrl, index }
    }).get()

    return { name, author, category_name, intro, cover_img, chapters, novels }
  }

  insertNovel(parmas, url, cb, fn) {
    let sql = "INSERT INTO novels(name, author, cover_img, category_name, last_update) VALUES (?,?,?,?,?)"
    this.db.query(sql, parmas)
      .then(res => {
        this.insertNovelWebsite(res.insertId, url, cb, fn)
      })
      .catch(e => {
        console.log(`novels ==> ${parmas[0]} : ${parmas[1]} url: ${url}`)
        cb(null)
      })
  }

  insertNovelWebsite(novelId, url, cb, fn) {
    let sql = "INSERT INTO novels_websites(novels_id, websites_id, url) VALUES(?,?,?)"
    this.db.query(sql, [novelId, this.webSiteId, url])
      .then(res => fn(novelId, cb))
      .catch(e => {
        console.log(`novels_websites ==> ${novelId} url: ${url}`)
        cb(null)
      })
  }
}

module.exports = NovelChapterSpider