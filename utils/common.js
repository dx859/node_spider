/**
 * Created by daixi on 2017/9/10.
 */
const crypto = require('crypto');
const {Console} = require('console');

exports.log = new Console(process.stdout, process.stderr);

exports.md5 = function (str) {
    return crypto.createHash('md5').update(str).digest('hex');
}
