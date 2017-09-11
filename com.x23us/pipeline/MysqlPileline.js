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

        let insertId = await this.asyncInsertNovel(item);
        await this.asyncInsertChapters(insertId, item.chapters);

        return item;
    }

    asyncInsertNovel(item) {
        return new Promise((resolve, reject) => {
            let sql = `
                INSERT INTO dd_novels(name, author, intro, url, image_path, image_url, category_name, status, update_at)
                    SELECT ?, ?, ?, ?, ?, ?, ?, ?, ? FROM DUAL
                    WHERE NOT EXISTS(SELECT id FROM dd_novels WHERE url=?)`;

            this.pool.query(sql, [item.name, item.author, item.intro, item.url, item.image_path, item.image_url, item.category_name, item.status, item.update_at, item.url],
                (err, results) => {
                    if (err) return reject(err);
                    if (!results.insertId) {
                        let sql = "SELECT id FROM dd_novels WHERE url=?";
                        this.pool.query(sql, [item.url], (err, results) => {
                            if (err) return reject(err);
                            resolve(results[0].id);
                        });
                    } else {
                        resolve(results.insertId);
                    }

                })
        })
    }

    asyncInsertChapters(novels_id, chapters) {
        return new Promise((resolve, reject) => {
            let sql = 'INSERT INTO dd_chapters(novels_id, title, chapter_index, url) VALUES ';

            chapters = chapters.filter(chapter => !this.chapterUrls.has(md5(chapter.href)));
            if (chapters.length === 0) {
                return resolve(null);
            }

            chapters.forEach((chapter, i, array) => {
                sql += `(${novels_id}, ${this.pool.escape(chapter.name)}, ${chapter.index}, ${this.pool.escape(chapter.href)})`;
                if (i < array.length - 1) {
                    sql += ','
                }
                this.chapterUrls.add(md5(chapter.href));
            });

            this.pool.query(sql, (err, results) => {
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