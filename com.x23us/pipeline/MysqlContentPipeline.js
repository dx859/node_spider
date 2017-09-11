/**
 * Created by daixi on 2017/9/11.
 */
/**
 * Created by daixi on 2017/9/10.
 */
const mysql = require('mysql');
const {md5} = require('../../utils/common');
const dbconf = require('../config').db;

class MysqlPileline {
    constructor() {
        this.pool = mysql.createConnection({
            connectionLimit: 10,
            host: dbconf.host,
            user: dbconf.user,
            port: dbconf.port,
            password: dbconf.password,
            database: dbconf.database
        });

    }

    setChapterUrls(chapterUrls) {
        this.chapterUrls = new Set(chapterUrls);
    }

    async process_item(item) {

        await this.asyncInsertContent(item);

        return item;
    }

    asyncInsertContent(item) {
        return new Promise((resolve, reject) => {
            let sql = 'INSERT INTO dd_contents(chapters_id, content) VALUES (?,?)';

            this.pool.query(sql, [item.chapter_id, item.content], (err, results) => {
                if (err) return reject(err);
                resolve(results);
            })
        })
    }

    close() {
        this.pool.end();
    }
}

module.exports = MysqlPileline;