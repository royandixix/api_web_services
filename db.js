const mysql = require('mysql2');
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'userdb'
})

db.connect(err => {
    if(err) {
        console.error('koneksi gagal bos', err)
        return;
    }else{
        console.log('koneksi suskes')
    }
});

module.exports = db;