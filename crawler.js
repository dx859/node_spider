var http = require('http')
var cheerio = require('cheerio')
var fs = require('fs')
var url = 'http://www.imooc.com/learn/348'

function filterChapters(html) {

    var $ = cheerio.load(html)

    var chapters = $('.chapter')

    var courseData = []

    chapters.each((index, elem) => {
        var chapter = $(elem)

        var chapterTitle = chapter.find('strong').text()

        var videos = chapter.find('.video').children('li')
        var chapterData = {
            chapterTitle: chapterTitle,
            videos: []
        }

        videos.each((index, elem) => {
            var video = $(elem).find('.studyvideo')
            var videoTitle = video.text()
            var id = video.attr('href').split('video/')[1]

            chapterData.videos.push({
                title: videoTitle,
                id: id
            })
        })

        courseData.push(chapterData)
    })

    return courseData
}

function printCourseInfo(courseData) {
    var txt = ''

    courseData.forEach((item) => {
        var chapterTitle = item.chapterTitle

        txt += chapterTitle + '\n'
        item.videos.forEach((video) => {
            txt += `    [${video.id}] ${video.title}\n`
        })
    })

    fs.writeFile('./chapter.txt', txt, (err) => {})
}

http.get(url, (res) => {
    var html = ''

    res.on('data', (data) => {
        html += data
    })

    res.on('end', () => {
        var courseData = filterChapters(html)
        printCourseInfo(courseData)
    })
})
