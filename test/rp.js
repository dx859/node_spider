const request = require('request')
const http = require('http')

let url = 'http://zhannei.baidu.com/cse/search?q=&p=2&s=11815863563564650233&entry=1'
// url = 'http://cnodejs.org/topic/570528bdc5f5b4a959e91913'


// http.get(url, (res) => {
//     res.setEncoding('utf8')
//     let rawData = ''
//     res.on('data', (chunk) => { rawData += chunk; })
//     res.on('end' , () => {
//         console.log(rawData)
//     })
// })



var opts = {
    url: url,
    headers: {
        'Accept':'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Encoding':'gzip, deflate',
        'Accept-Language':'zh-CN,zh;q=0.8,en;q=0.6',
        'Cache-Control':'no-cache',
        'Connection':'keep-alive',
        'Cookie':'BDUSS=1ZjY0hlOEdHMU8xNS1GU0VLTVJ6eldnaEhOZzBEcGdaUVQzRnhvOE0yUFlyaWRaSVFBQUFBJCQAAAAAAAAAAAEAAABrETEMZGFpeGk4NTkAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAANghAFnYIQBZU; __cfduid=d8d67184b5661f8618cf9e9bbb696c9c81494158884; BAIDUID=76DDDE02244AA969D7F606A01ABD9A70:FG=1; BIDUPSID=812A12DBCCFAE33670B7840224EB2CA3; PSTM=1499264266; BDRCVFR[feWj1Vr5u3D]=I67x6TjHwwYf0; PSINO=7; H_PS_PSSID=1432_21086_17001; BDORZ=B490B5EBF6F3CD402E515D22BCDA1598',
        'Host':'zhannei.baidu.com',
        'Pragma':'no-cache',
        'Upgrade-Insecure-Requests':1,
        'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.101 Safari/537.36',
    }
}

request(url, (err, response, body) => {
    console.log(body)
})