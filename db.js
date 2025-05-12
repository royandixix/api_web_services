// db.js
const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'userdb'
});

db.connect(err => {
    if (err) {
        console.error('Koneksi gagal bos:', err);
        return;
    } else {
        console.log('Koneksi sukses ke database');
    }
});

module.exports = db;
