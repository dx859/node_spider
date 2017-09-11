const db = require('../libs/db')

db.query('select count(id) count from novels')
  .then(res=>{
    console.log(res[0].count)
    db.end()
  })
  .catch(e=>console.log(e))
