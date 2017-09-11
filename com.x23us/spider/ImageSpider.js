/**
 * Created by daixi on 2017/9/11.
 */

const dbtool = require('../../libs/db');
const {db} = require('./../config');

class ImageSpider {
    async init() {
        dbtool.configure({
            host: db.host,
            user: db.user,
            port: db.port,
            password: db.password,
            database: db.database
        });
        let img_urls = await dbtool.query('SELECT id, image_url FROM dd_novels WHERE image_path IS NULL');
    }

}

module.exports = ImageSpider;

if (module.parent === null) main();

async function main() {
    let image = new ImageSpider();
    await image.init();
    image.start();
}