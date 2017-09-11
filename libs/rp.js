let request = require('request')

let j = request.jar()
request = request.defaults({ jar: j })

exports.rp = function(arg) {
    return new Promise((resolve, reject) => {
        let startTime = Date.now()
        request(arg, (err, response, body) => {
            if (err) {
                reject(err)
            } else {
                if (response.statusCode >= 200 && response.statusCode <400)
                    resolve(body)
                else
                    reject(`获取页面失败，statusCode：${response.statusCode}`)
            }
        })
    })
}