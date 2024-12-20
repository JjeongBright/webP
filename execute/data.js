const pool = require('./db'); // MySQL 연결 풀 가져오기

async function getId(id) {
    try {
        const [rows] = await pool.query('SELECT id FROM Student WHERE id = ?', [id]);
        return rows.length > 0 ? rows[0].id : null;
    } catch (error) {
        console.error('Error in getId:', error);
        throw error;
    }
}

async function getPassword(id) {
    try {
        const [rows] = await pool.query('SELECT password FROM Student WHERE id = ?', [id]);
        return rows.length > 0 ? rows[0].password : null;
    } catch (error) {
        console.error('Error in getPassword:', error);
        throw error;
    }
}

async function getName(id) {
    try {
        const [rows] = await pool.query('SELECT name FROM Student WHERE id = ?', [id]);
        return rows.length > 0 ? rows[0].name : null;
    } catch (error) {
        console.error('Error in getPassword:', error);
        throw error;
    }
}

async function getLaboratory(id) {
    const [rows] = await pool.query('SELECT laboratory FROM student WHERE id = ?', [id]);
    return rows[0].laboratory;
}
async function getPosition(id) {
    const [rows] = await pool.query('SELECT Position FROM student WHERE id = ?', [id]);
    return rows[0].Position;
}
async function getImage(id, idx) {
    const [rows] = await pool.query('SELECT graph_image FROM TranAD_file WHERE id = ? AND tranAD_ID = ?', [id, idx]);
    if (rows.length > 0) {
        return rows[0]; // 첫 번째 행 반환
    } else {
        return null;
    }
}

async function insertCNN(fileName, graphImage, status, tranADid, id) {
    await pool.query('INSERT INTO TranAD_file VALUES (?, ?, ?, ?, ?)', [fileName, graphImage, status, tranADid, id]);
}

async function getState(id, idx) {
    const [rows] = await pool.query('SELECT status FROM TranAD_file where id = ? AND tranAD_ID = ?', [id, idx]);
    return rows[0].status;
}

async function getFileName(id, idx) {
    const [rows] = await pool.query('SELECT file_name FROM TranAD_file where id = ? AND tranAD_ID = ?', [id, idx]);
    return rows[0].file_name;
}

async function getCount(id) {
    const [rows] = await pool.query('SELECT count(id) as count FROM TranAD_file where id = ?', [id]);
    return rows[0].count == null ? 0 : rows[0].count;
}

module.exports = {
    getId,
    getPassword,
    getName,
    getImage,
    insertCNN,
    getFileName,
    getState,
    getCount,
    getLaboratory,
    getPosition
};
