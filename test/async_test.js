const asyncLibs = require('async')
const fs = require('fs')
const path = require('path')
const urllibs = require('url')
const request = require('request')
const iconv = require('iconv-lite')
const cheerio = require('cheerio')

require('dotenv').config({ path: path.resolve(__dirname, '..', '..', '.env') })
const { rp } = require('../libs/rp')


async function getPageInfo(url) {
    let host = (new urllibs.URL(url)).origin
    let buffer = await rp({ url: url, encoding: null })
    let html = iconv.decode(buffer, 'gbk')
    let $ = cheerio.load(html, { decodeEntities: false, xmlMode: true })

    let name = $('#info h1').text()
    let author = $('#info p').eq(0).text().replace(/^.*者：/, '')
    let intro = $('#intro p').text()
    let cover_img = urllibs.resolve(host, $('#fmimg img').attr('data-cfsrc'))

    let chapters = $('#list dd a').map((i, el) => {
        let href = urllibs.resolve(host, $(el).attr('href'))
        let title = $(el).text()
        return {title, href}
    }).get()

    return { name, author, intro, cover_img, chapters }
}



async function __main() {
    let url = 'http://www.biquzi.com/0_703/'
    // url = 'http://www.biquzi.com/0_700/'
    let websiteName = '笔趣阁'

    let urlObj = new urllibs.URL(url)
    let host = urlObj.host
    let origin = urlObj.origin
    
    let { name, author, intro, cover_img, chapters } = await getPageInfo(url)

    let startTime = Date.now()

    // 1 230056
    let q = asyncLibs.queue(function(task, callback) {
        request({url: task.href, encoding: null, timeout: 5000}, function(err, responses, body){
            let html = iconv.decode(body, 'gbk')
        
            let $ = cheerio.load(html, { decodeEntities: false, xmlMode: true })
            let title = task.title
            let content = $('#content').html().replace(/<br\/>/g, '').replace(/&nbsp;/g, ' ')
            callback(err, title)
        })
    }, 2)

    for(let i=0; i<chapters.length; i++) {
        q.push(chapters[i], function(err, title) {
            if (err) return console.log(err)

            console.log(title)

        })
    }

    q.drain = function() {
        console.log('end: ', Date.now() - startTime)
    }
}


__main()

// var q = asyncLibs.queue(function(task, callback) {
//     console.log('hello ' + task.name);
//     callback();
// }, 2);

// // assign a callback
// q.drain = function() {
//     console.log('all items have been processed');
// };

// // add some items to the queue
// q.push({name: 'foo'}, function(err) {
//     console.log('finished processing foo');
// });
// q.push({name: 'bar'}, function (err) {
//     console.log('finished processing bar');
// });

// // add some items to the queue (batch-wise)
// q.push([{name: 'baz'},{name: 'bay'},{name: 'bax'}], function(err) {
//     console.log('finished processing item');
// });

// // add some items to the front of the queue
// q.unshift({name: 'bar'}, function (err) {
//     console.log('finished processing bar');
// });