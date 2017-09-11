const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') })

const imagedir = path.join(__dirname, 'images');

if (!fs.existsSync(imagedir)) fs.mkdirSync(imagedir);


module.exports = {
    imagedir,
    limit: 5,
    db: {
        host: process.env.LOCAL_DB_HOST || '127.0.0.1',
        port: process.env.LOCAL_DB_PORT || 3306,
        user: process.env.LOCAL_DB_USER || 'root',
        password: process.env.LOCAL_DB_PASS || '',
        database: process.env.LOCAL_B_NAME || 'spider',
    },
}