const db = require('../libs/db')

async function __main() {
  db.configure({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
  })
  let obj = await db.query("SELECT id, intro FROM novels")

  let objs = obj.map(item => {
    if (item.intro != null) {
      item.intro = item.intro.replace(/^\s*|\s*$/, '')
    }
    return {
      id: item.id,
      intro: item.intro
    }
  })

  db.configure({
    host: process.env.A_DB_HOST,
    port: process.env.A_DB_PORT,
    user: process.env.A_DB_USER,
    password: process.env.A_DB_PASS,
    database: process.env.A_DB_NAME,
  })


  for (let i=0; i<obj.length; i++) {
    let res = await db.query("UPDATE novels SET intro=? WHERE id=?", [obj[i].intro, obj[i].id]) 
    console.log(obj[i].id)
  }

  db.end()
}


__main()