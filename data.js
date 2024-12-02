const pool = require('./index'); // MySQL 연결 풀 가져오기

async function getId(id) {
    try {
        const [rows] = await pool.query('SELECT id FROM example WHERE id = ?', [id]);
        return rows.length > 0 ? rows[0].id : null;
    } catch (error) {
        console.error('Error in getId:', error);
        throw error;
    }
}

async function getPassword(id) {
    try {
        const [rows] = await pool.query('SELECT password FROM example WHERE id = ?', [id]);
        return rows.length > 0 ? rows[0].password : null;
    } catch (error) {
        console.error('Error in getPassword:', error);
        throw error;
    }
}

module.exports = {
    getId,
    getPassword,
};
