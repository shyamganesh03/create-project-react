const { execSync } = require('child_process');

function cloneRepository({ repoUrl }) {
    try {
        // Execute git clone command synchronously
        const output = execSync(`git clone ${repoUrl}`, { encoding: 'utf-8' });

        // Log the output
        console.log(output);

        // If the command executes successfully, resolve the promise
        return Promise.resolve('Clone process finished successfully');
    } catch (error) {
        // If an error occurs, reject the promise with the error message
        return Promise.reject(`Clone process failed: ${error.message}`);
    }
}

module.exports = cloneRepository;
