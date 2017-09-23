const fs = require('fs')
const path = require('path')
const url = require('url')
const mysql = require('mysql')
const request = require('request')
const {db} = require('../config')
const {md5} = require('../../utils/common')

const conn = mysql.createConnection(db)

conn.query('select id, image_url from dd_novels', function (err, results) {
    if (err) return console.error(err)
    conn.end()

    results = results.map((item) => ({id: item.id, image_url: item.image_url}))

    let num = 0, limit = 5, running = 0


    download()

    function download() {
        while (running < limit && results.length > 0) {
            let {id, image_url} = results.shift()
            let pathname = url.parse(image_url).pathname;
            let name = md5(pathname) + path.extname(pathname);
            let startTime = Date.now()
            request
                .get(image_url)
                .on('end', () => {
                    running--
                    download()
                    console.log(`${id}=>${image_url}=>${Date.now() - startTime}ms:running=>${running}`)
                })
                .pipe(fs.createWriteStream(path.resolve(__dirname, '..', 'images', name)))

            running++
        }
    }
})
