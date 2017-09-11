const path = require('path')
const fs = require('fs')
const asyncLibs = require('async')

const log = console.log.bind(console)

function concatTest() {
    let dir1 = path.join(__dirname, '../test')
    dir2 = path.join(__dirname, '../novel')
    dir3 = path.join(__dirname, '../libs')
    dir4 = path.join(__dirname, '../git_login')

    asyncLibs.concat([dir1, dir2, dir3, dir4], function(dir, callback) {
        let arr = fs.readdirSync(dir)
        callback(null, arr)
    }, function(err, files) {
        console.log(files)
    })
}


function eachTest() {
    let arr = fs.readdirSync(__dirname)
    asyncLibs.eachOf(arr, function (file, key, cb) {
        fs.writeFile(path.join(__dirname, '../.tmp', file), 'hello' + key, cb)
    }, function (err) {
        if (err) {
            log(err)
        } else {
            log('All files have been success')
        }
    })
}

function filterTest() {
    let arr = fs.readdirSync(__dirname)
    asyncLibs.filter(arr, function (file, cb) {
        cb(null, /^a/.test(file))
    }, function (err, results) {
        log(results)
    })
}

function mapTest() {
    let arr = fs.readdirSync(__dirname)
    asyncLibs.map(arr, function (file,cb) {
        cb(null, file)
    }, function (err, results) {
        log(results)
    })
}

function applyEactTest() {
    asyncLibs.applyEach([hello, good], 'Jack', function (err, str) {
        log(str)
    })

    function hello(str, cb) {
        log( 'hello: '+str)
        cb(null, 'hello: '+str)
    }

    function good(str, cb) {
        log('good: ' + str)
        cb(null, 'good: ' + str)
    }

    asyncLibs.each(['Marria', 'name'], asyncLibs.applyEach([hello, good]), function (err, str) {
        log(err)
    })
}

function seriesTest() {
    let startTime = Date.now()
    asyncLibs.series([
        function (callback) {
            setTimeout(function () {
                callback(null, 1)
            }, 2000)
        },
        function (callback) {
            setTimeout(function () {
                callback(null, 2)
            }, 1000)
        }
    ], function (err, results) {
        log(results)
        log('end: ', Date.now() - startTime)
    })
}

function parallelTest() {
    let startTime = Date.now()
    asyncLibs.parallel([
        function (callback) {
            setTimeout(function () {
                callback('戳无', 1)
            }, 2000)
        },
        function (callback) {
            setTimeout(function () {
                callback(null, 2)
            }, 1000)
        },
        function (callback) {
            setTimeout(function () {
                callback('3错误了', 3)
            }, 500)
        },
    ], function (err, results) {
        // if (err) {
            log(err)
        // } else {
            log(results)
            log('end: ', Date.now() - startTime)    
        // }
    })
}
function __main() {
    // concatTest()
    // eachTest()
    // filterTest()
    // mapTest()
    // applyEactTest()
    parallelTest()
}




__main()