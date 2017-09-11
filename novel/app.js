const urllibs = require('url')
const path = require('path')
const iconv = require('iconv-lite')
const cheerio = require('cheerio')
const asyncLibs = require('async')
const request = require('request')
const mysql = require('mysql')
const fs = require('fs')

const NovelSpider = require('./NovelSpider')
const ChapterSpider = require('./ChapterSpider')
const TestChapterSpider = require('./TestChapterSpider')
const ContentSpider = require('./ContentSpider')
const NovelChapterSpider = require('./NovelChapterSpider')

const { rp } = require('../libs/rp')
const db = require('../libs/db')

const log = console.log.bind(console)

async function main() {

    await spider2()
}

async function spider2() {
    const accessUrl = 'http://www.biquzi.com/5_5008/'
    let ncs = new NovelChapterSpider(db, 1, accessUrl)
    let objs = await ncs.spiderUrls(5)
  
    db.end()
}


async function spider1(argument) {
    // const WebsiteOrigin = 'http://www.biquzi.com'
    // const WebsiteId = 1

    // // let novelspider = new NovelSpider(db, 1)
    // // await novelspider.spiderUrls(5)

    // // await new ChapterSpider(db, 1).spiderUrls(5)
    // // for (let i = 0; i < 10; i++) {
    // //     await new ContentSpider(db, 10).spiderUrls(20)
    // // }'

    // await new TestChapterSpider(db, 1).spiderUrls(5)
    // db.end()
}

main()