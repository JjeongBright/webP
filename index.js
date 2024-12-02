// db.js
const mysql = require('mysql2');

const pool = mysql.createPool({
    host: '127.0.0.1',
    user: '', // 사용자명
    password: '', // 비밀번호
    database: 'webP',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

module.exports = pool.promise();
