const { exec } = require('child_process');

async function executePython(res, callback) {
    const commands = `
        cd tranAD_python &&
        python usingModel.py
    `;
    exec(commands, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error: ${stderr}`);
            return res.redirect('index');
        }
        console.log(`Python Output: ${stdout}`);
        if (callback) callback();
    });
}

module.exports = {
    executePython,
};
