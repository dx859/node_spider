/**
 * Created by daixi on 2017/9/10.
 */
const JobbleSpider = require('./JobbleSpider');

async function main() {
    
    let jobble = new JobbleSpider();
    jobble.start();
}

main();