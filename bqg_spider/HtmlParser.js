const cheerio = require('cheerio')
const urllibs = require('url')

class HtmlParser {

  parserHtml(url, html) {
    let $ = cheerio.load(html, { decodeEntities: false, xmlMode: true })

    let category_name = $('meta[property="og:novel:category"]').attr('content')
    let last_update = $('meta[property="og:novel:update_time"]').attr('content')
    let name = $('#info h1').text()
    let author = $('#info p').eq(0).text().replace(/^.*者：/, '')
    let intro = $('#intro p').text().replace(/^\s*|\s*$/g, '')
    let cover_img = urllibs.resolve(url, $('#fmimg img').attr('data-cfsrc'))

    let newUrls = $('.footer_link a').map((index, el) => {
      return urllibs.resolve(url, $(el).attr('href'))
    }).get()

    let chapters = $('#list dd a').map((index, el) => {
      let originUrl = urllibs.resolve(url, $(el).attr('href'))
      let title = $(el).text()
      return { title, originUrl, index }
    }).get()

    return { newData: { name, author, category_name, intro, cover_img, last_update, chapters }, newUrls }
  }

  parseContent(html) {
    let $ = cheerio.load(html, { decodeEntities: false, xmlMode: true })
    let content = $('#content').html().replace(/(^\s*)|(\s*$)/g, '').replace(/<br\/>/g, '').replace(/&nbsp;/g, ' ')
    return content
  }
}

module.exports = HtmlParser