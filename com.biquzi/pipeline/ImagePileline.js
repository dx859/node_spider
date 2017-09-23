/**
 * Created by daixi on 2017/9/10.
 */
const fs = require('fs');
const path = require('path');
const urlLib = require('url');
const request = require('request');
const {md5} = require('../../utils/common');
const config = require('../config');


class ImagePileline {
    async process_item(item) {
        // item.image_path = this.downloadImage(item.image_url);
        item.image_path = '';
        return item;
    }

    downloadImage(url) {
        let pathname = urlLib.parse(url).pathname;
        let name = md5(pathname) + path.extname(pathname);
        request(url).pipe(fs.createWriteStream(path.join(config.imagedir, name)));

        return name;
    }
}

module.exports = ImagePileline;