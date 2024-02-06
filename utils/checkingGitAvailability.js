const { execSync } = require('child_process')

function isGitAvailable() {
    try {
        execSync('git --version')
        return true
    } catch (error) {
        return false
    }
}

module.exports = isGitAvailable
