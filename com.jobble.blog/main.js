/**
 * Created by daixi on 2017/9/10.
 */
const fs = require('fs');
const JobbleSpider = require('./JobbleSpider');
const dbconf = require('./config').db;
const db = require('../libs/db');



async function main() {
    db.configure({
        host: dbconf.host,
        user: dbconf.user,
        port: dbconf.port,
        password: dbconf.password,
        database: dbconf.database
    });
    let res = await db.query('SELECT url FROM jobble_article');
    db.end();

    let jobble = new JobbleSpider();
    res.forEach((item) => {
        jobble.oldUrls.add(item.url);
    });
    jobble.start();
}

main();