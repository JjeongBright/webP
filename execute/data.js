const pool = require('./db'); // MySQL 연결 풀 가져오기

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

async function getName(id) {
    try {
        const [rows] = await pool.query('SELECT name FROM example WHERE id = ?', [id]);
        return rows.length > 0 ? rows[0].name : null;
    } catch (error) {
        console.error('Error in getPassword:', error);
        throw error;
    }
}

async function getImage(id) {
    const [rows] = await pool.query('SELECT graph_image FROM cnn_file WHERE id = ?', [id]);
    if (rows.length > 0) {
        return rows[0]; // 첫 번째 행 반환
    } else {
        return null;
    }
}

async function insertCNN(id, fileName, graphImage, status, canId) {
    await pool.query('INSERT INTO CNN_FILE VALUES (?, ?, ?, ?, ?)', [id, fileName, graphImage, status, canId]);
}

module.exports = {
    getId,
    getPassword,
    getName,
    getImage,
    insertCNN
};
