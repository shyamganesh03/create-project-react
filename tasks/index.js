'use strict';

const fs = require('fs');
const path = require('path');
const cp = require('child_process');


const cleanup = () => {
    console.log('Cleaning up.');
    // Reset changes made to package.json files.
    cp.execSync(`git checkout -- packages/*/package.json`);
    // Uncomment when snapshot testing is enabled by default:
    // rm ./template/src/__snapshots__/App.test.js.snap
};

const handleExit = () => {
    cleanup();
    console.log('Exiting without error.');
    process.exit();
};

const handleError = e => {
    console.error('ERROR! An error was encountered while executing');
    console.error(e);
    cleanup();
    console.log('Exiting with error.');
    process.exit(1);
};

process.on('SIGINT', handleExit);
process.on('uncaughtException', handleError);


console.log('Checking the git status...')

const gitStatus = cp.execSync(`git status --porcelain`).toString();

if (gitStatus.trim() !== '') {
    console.log('git check has been completed successfully')
}