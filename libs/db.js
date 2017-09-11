const mysql = require('mysql')
const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') })
class DB {
    constructor(opts) {
        this.conn = null
        this.opts = opts
        if (opts != null) {
            this.conn = mysql.createConnection(opts)
        }
    }

    configure(opts) {
        this.opts = opts
        if (this.conn) this.end()
        this.conn = mysql.createConnection(opts)
    }

    query(sql, data) {
        return new Promise((resolve, reject) => {
            if (data == null) {
                this.conn.query(sql, function(err, results, fields) {
                    if (err) 
                        reject(err)
                    else 
                        resolve(results)
                    
                })

            } else {
                this.conn.query(sql, data, function(err, results, fields) {
                    if (err)
                        reject(err)
                    else
                        resolve(results)
                })
            }
        })
    }

    end() {
        this.conn.end()
    }
}

module.exports = new DB({
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'novel',
})

