/**
 * Created by daixi on 2017/9/10.
 */
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') })

module.exports = {
    imagedir: path.join(__dirname, 'images'),
    db: {
        host: process.env.LOCAL_DB_HOST || '127.0.0.1',
        port: process.env.LOCAL_DB_PORT || 3306,
        user: process.env.LOCAL_DB_USER || 'root',
        password: process.env.LOCAL_DB_PASS || '',
        database: process.env.LOCAL_B_NAME || 'spider',
    },
}