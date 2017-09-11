const log = console.log.bind(console)

function a() {
    return new Promise((resolve, reject) => {
        setTimeout(function() {
            reject('a')
        }, 1000)
    })
}

function b() {
    return new Promise((resolve, reject) => {
        setTimeout(function() {
            reject('b')
        }, 1000)
    })
}

function c() {
    return new Promise((resolve, reject) => {
        setTimeout(function() {
            resolve('c')
        }, 1000)
    })
}


a().then(res => {
    // log(res)
    log('a成功')
    return b()
}).then(res => {
    log('b成功')
}).catch(e => {
    log('b失败')
})