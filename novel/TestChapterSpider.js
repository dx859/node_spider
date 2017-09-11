const ChapterSpider = require('./ChapterSpider')

class TestChapterSpider extends ChapterSpider {

  afterGetPage(item, url, callback) {
    this.insertNovelIntro(item.urlCol.novels_id, item.intro, callback)
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

module.exports = TestChapterSpider