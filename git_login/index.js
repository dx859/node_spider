const https = require('https')
const fs = require('fs')
const cheerio = require('cheerio')
const { rp } = require('../libs/rp')

const URL = 'https://github.com/'
const LoginURL = 'https://github.com/login'
const SessionURL = 'https://github.com/session'


async function __main(argv) {
    let html = await rp(LoginURL)
    let $ = cheerio.load(html)
    const token = $('input[name=authenticity_token]').val()
    const postData = {
        commit: 'Sign in',
        utf8: '✓',
        authenticity_token: token,
        login: argv[0],
        password: argv[1],
    }
    await rp({ uri: SessionURL, method: 'POST', form: postData })

    html = await rp(URL)

    let startTime = Date.now()
    $ = cheerio.load(html)
    let arr = $('li.public span.repo').map((i, el) => $(el).text()).get()

    console.log(arr)
}


__main(process.argv.slice(2))