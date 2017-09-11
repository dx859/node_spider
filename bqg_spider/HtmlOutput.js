const asyncLibs = require('async')
const db = require('../libs/db')
const UrlManager = require('./UrlManager')
const log = console.log.bind(console)

class HtmlOutput {
  constructor(name, origin) {
    this.name = name
    this.origin = origin
    this.chapterUrls = new Set()
    this.novelWebsiteUrls = new Set()
    this.contentUrls = new Set()
  }

  async initContent() {
    let sql = `
      SELECT c.id, c.origin_url FROM chapters c 
        LEFT JOIN contents con ON c.id=con.chapters_id
        WHERE con.id IS NULL
        LIMIT 10000`
    let urls = await db.query(sql)

    return urls.map(url => ([url.origin_url, url.id]))
  }

  async init() {
    let urls = await db.query("SELECT origin_url FROM chapters")
    let nwUrls = await db.query("SELECT url FROM novels_websites")
    this.chapterUrls = new Set(urls.map(url => url.origin_url))
    this.novelWebsiteUrls = new Set(nwUrls.map(url => url.url))

    await this.insertWebsite()
  }

  async getAccessUrls() {
    let sql = "SELECT url FROM novels_websites"
    let objs = await db.query(sql)
    return objs.map(obj => obj.url)
  }

  async insertWebsite() {
    let sql = `
      INSERT INTO websites(name, origin) 
        SELECT ?, ? FROM DUAL 
        WHERE NOT EXISTS(SELECT id FROM websites WHERE origin=?)`
    let { insertId } = await db.query(sql, [this.name, this.origin, this.origin])

    if (!insertId) {
      sql = 'SELECT id FROM websites WHERE origin=?'
      insertId = (await db.query(sql, [this.origin]))[0].id
    }

    this.websiteId = insertId
    return insertId
  }

  async collectData(url, data) {
    let id = await this.insertNovel(data)
    await this.insertNovelWebsite(url)
    await this.insertChaptersAll(data.chapters)
    return id
  }

  async insertNovel(data) {
    let id = 0

    let sql = `INSERT INTO novels(name, author, cover_img, category_name, intro, last_update) 
            SELECT ?, ?, ?, ?, ?, ? FROM DUAL 
            WHERE NOT EXISTS(SELECT id FROM novels WHERE name=? and author=?)`
    id = (await db.query(sql, [data.name, data.author, data.cover_img, data.category_name, data.intro, data.last_update, data.name, data.author])).insertId
    if (!id) {
      sql = "SELECT id FROM novels WHERE name=? AND author=?"
      id = (await db.query(sql, [data.name, data.author]))[0].id
    }

    this.novelId = id
    return id
  }

  async insertNovelWebsite(url) {
    if (this.novelWebsiteUrls.has(url)) return

    let sql = "INSERT INTO novels_websites(novels_id, websites_id, url) VALUES(?,?,?)"
    await db.query(sql, [this.novelId, this.websiteId, url])
    this.novelWebsiteUrls.add(url)

  }

  async insertChaptersAll(chapters) {
    let sql = 'INSERT INTO chapters(novels_id, websites_id, title, chapter_index, origin_url) VALUES '
    let novelId = this.novelId,
      websiteId = this.websiteId;
    chapters = chapters.filter(chapter => !this.chapterUrls.has(chapter.originUrl))
    if (chapters.length === 0) return;
    chapters.forEach((chapter, index, array) => {
      sql += `(${novelId}, ${websiteId}, ${db.conn.escape(chapter.title)}, ${chapter.index}, ${db.conn.escape(chapter.originUrl)})`
      if (index < array.length - 1) {
        sql += ','
      }
    })

    await db.query(sql)
    chapters.forEach(chapter => {
      this.chapterUrls.add(chapter.originUrl)
    })
  }

  async insertChapters(chapters) {

    let newChapters = [],
      index = 0,
      len = 1000

    while (index < chapters.length) {
      newChapters.push(chapters.slice(index, index += len))
    }

    for (let i = 0; i < newChapters.length; i++) {
      await this.pInsertChapters(newChapters[i])
    }
  }

  async saveContent(content, id) {
    let sql = `INSERT INTO contents (content, chapters_id) VALUES (?,?)`
    await db.query(sql, [content, id])
  }

  insertChapter(novelId, websiteId, chapter, cb) {
    let sql = `INSERT INTO chapters(novels_id, websites_id, title, chapter_index, origin_url) VALUES (?,?,?,?,?)`
    db.query(sql, [novelId, websiteId, chapter.title, chapter.index, chapter.originUrl])
      .then(res => {
        this.urls.add(chapter.originUrl)
        cb(null)
      })
      .catch(e => {
        cb(null)
      })

  }
}

module.exports = HtmlOutput