const path = require('path')
const mysql = require('mysql')
const fs = require('fs')
const {db} = require('../config')

const conn = mysql.createConnection(db)

const start = Date.now()

conn.query('select url from dd_chapters', function (err, results) {
    if (err) return console.log(err)
    conn.end()
    var insert = Date.now()
    var str = ''
    console.log(insert - start, 'ms')
    var filepath = path.resolve(__dirname, '..', 'log', 'chaptersUrl.log')

    var writeable = fs.createWriteStream(filepath, {flags: 'w'})

    results = results.map((url) => url.url)
    var arr = []
    var maxlen = 10000
    for (var i=0, len = results.length;i<len; i+= maxlen) {
        arr.push(results.slice(i, i+maxlen))
    }
    arr.forEach((itemarr, index)=> {
        var str = ''
        for (var i=0; i<itemarr.length; i++) {
            str += itemarr[i] + '\n'
        }
        writeable.write(str)
    })

    writeable.end()
    writeable.on('finish', function () {
        console.log(Date.now() - insert, 'ms')
    })

    writeable.on('error', function (err) {
        console.log(err)
    })

})