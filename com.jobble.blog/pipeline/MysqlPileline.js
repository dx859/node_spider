/**
 * Created by daixi on 2017/9/10.
 */
const mysql = require('mysql');
const {md5} = require('../../utils/common');
const dbconf = require('../config').db;

class MysqlPileline {
    constructor() {
        this.pool = mysql.createConnection({
            connectionLimit : 10,
            host            : dbconf.host,
            user            : dbconf.user,
            port            : dbconf.port,
            password        : dbconf.password,
            database        : dbconf.database
        });

    }

    async process_item(item) {
        item.url_obj_id = md5(item.url);

        item = await this.asyncInsert(item);

        return item;
    }

    asyncInsert(item) {
        return new Promise((resolve, reject) => {
            let sql = `
                INSERT INTO jobble_article(title, create_at, url, url_obj_id, front_img_url, front_img_path, comment_nums, fav_nums, praise_nums, tags, category, content)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

            this.pool.query(sql, [item.title, item.create_at, item.url, item.url_obj_id, item.front_img_url, item.front_img_path,
                item.comment_nums, item.fav_nums, item.praise_nums, item.tags, item.category, item.content],
                (err, results) =>{
                if (err) return reject(err);
                resolve(item);
            })
        })
    }

    close() {
        this.pool.end();
    }
}

module.exports = MysqlPileline;