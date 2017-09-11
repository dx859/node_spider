/**
 * Created by daixi on 2017/9/11.
 */

const DingDianSpider = require('./spider/DingDianSpider');
const ContentSpider = require('./spider/ContentSpider');

async function main() {

    let dingdian = new DingDianSpider();
    await dingdian.init();
    dingdian.start();

}


main();