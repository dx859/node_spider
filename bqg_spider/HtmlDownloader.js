const request = require('request')
const iconv = require('iconv-lite')

class HtmlDownloader {
  download(url, character='utf8') {
    return new Promise((resolve, reject) => {
      request({ url: url, encoding: null, timeout: 2000 }, (err, res, body) => {
        if (err) {
          console.log(err)
          return reject(err)
        } 
        if (res.statusCode === 200) {
          let html = iconv.decode(body, character)
          resolve(html)
        } else {
          reject(`获取页面：${url}失败`)
        }
      })
    })
  }

}

module.exports = HtmlDownloader