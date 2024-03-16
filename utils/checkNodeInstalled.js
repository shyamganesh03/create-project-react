const { exec } = require('child_process')

function checkNodeInstalled() {
    return new Promise((resolve, reject) => {
        exec('node -v', (error, stdout, stderr) => {
            if (error) {
                reject(error);
                return;
            }
            // Regular expression to separate numbers from text
            const regex = /(\d+(\.\d+)?)/g;

            // Extract numbers from the input string
            const version = stdout.match(regex);

            const nodeVersion = parseFloat(version);
            if (!isNaN(nodeVersion)) {
                resolve(nodeVersion);
            } else {
                reject(new Error(`Please install node!`));
            }
        });
    });
}
module.exports = checkNodeInstalled
