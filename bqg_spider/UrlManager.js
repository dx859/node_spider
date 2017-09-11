const path = require('path')
const fs = require('fs')

class UrlManager {
  constructor() {
    this.newUrls = new Set()
    this.oldUrls = new Set()
    this.errUrls = new Set()
    this.getUrlfromFile()
  }

  addNewUrl(url) {
    if (url === undefined)
      return
    if (!this.oldUrls.has(url) && !this.errUrls.has(url))
      this.newUrls.add(url)
  }

  addNewUrls(urls) {
    urls.forEach((url) => { this.addNewUrl(url) })
  }

  addErrUrl(url) {
    this.errUrls.add(url)
    this.newUrls.delete(url)
  }

  getNewUrl() {
    return this.newUrls.values().next().value
  }

  getNewUrls(num) {
    let i = 0,
      urls = []
    for (let item of this.newUrls.values()) {
      urls.push(item)
      i++
      if (i === num) break
    }
    return urls
  }

  hasNewUrl() {
    return this.newUrls.size !== 0
  }

  deleteUrl(url) {
    this.newUrls.delete(url)
    this.oldUrls.add(url)
  }

  getUrlfromFile() {
    try {
      let arr = fs.readFileSync(path.join(__dirname, 'url_data', 'new_url.data'), { encoding: 'utf8' }).split('\n')
      arr.pop()
      this.addNewUrls(arr)
      arr = fs.readFileSync(path.join(__dirname, 'url_data', 'old_url.data'), { encoding: 'utf8' }).split('\n')
      arr.pop()
      this.oldUrls = new Set(arr)
    } catch (e) {}
  }

  saveUrl() {
    let dataPath = path.join(__dirname, 'url_data')
    if (!fs.existsSync(path.join(dataPath))) {
      fs.mkdirSync(dataPath)
    }

    let newUrlStr = '',
      oldUrlStr = '',
      errUrlStr = '';
    if (this.newUrls.size) {
      newUrlStr = Array.from(this.newUrls.keys()).join('\n') + '\n'
    }

    if (this.oldUrls.size) {
      oldUrlStr = Array.from(this.oldUrls.keys()).join('\n') + '\n'
    }

    if (this.errUrls) {
      errUrlStr = Array.from(this.errUrls.keys()).join('\n') + '\n'
    }

    fs.writeFileSync(path.join(dataPath, 'new_url.data'), newUrlStr)
    fs.writeFileSync(path.join(dataPath, 'old_url.data'), oldUrlStr)
    fs.appendFileSync(path.join(dataPath, 'err_url.data'), errUrlStr)

  }
}

module.exports = UrlManager