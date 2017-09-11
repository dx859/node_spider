const crypto = require('crypto')
const db = require('../libs/db')



function md5(str, len=16) {
  return crypto.createHash('md5').update(str).digest('hex')
}

class UrlCollection {
  constructor() {
    this.novelUrls = new Set() // 未爬取的小说url
    this.chapterUrls = new Set() // 未爬取的章节url
    this.spiderNovelUrls = new Set() // 已爬取的小说url
    this.spiderChapterUrls = new Set() // 已爬取的章节url
  }

  async init() {
    let objs = await this._getChapterUrls()
    this.spiderChapterUrls = new Set(objs.map(item => md5(item.origin_url)))
    console.log(this.spiderChapterUrls)
  }



  async _getNovelUrls() {
    return await db.query('SELECT novels_id, websites_id, url FROM novels_websites')
  }

  async _getChapterUrls() {
    return await db.query('SELECT origin_url FROM chapters Limit 100')
  }



}

module.exports = UrlCollection