const path = require('path');
const fs = require('fs');
const {Console} = require('console');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const imagedir = path.join(__dirname, 'images');
const logdir = path.join(__dirname, 'logdir');
if (!fs.existsSync(imagedir)) fs.mkdirSync(imagedir);
if (!fs.existsSync(logdir)) fs.mkdirSync(logdir);


module.exports = {
    imagedir,
    logdir,
    limit: 5,
    db: {
        host: process.env.LOCAL_DB_HOST || '127.0.0.1',
        port: process.env.LOCAL_DB_PORT || 3306,
        user: process.env.LOCAL_DB_USER || 'root',
        password: process.env.LOCAL_DB_PASS || '',
        database: process.env.LOCAL_B_NAME || 'spider',
    },
}