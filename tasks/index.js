#!/usr/bin/env node
'use strict'
const cp = require('child_process')
const shell = require('shelljs');
const isGitAvailable = require('../utils/checkingGitAvailability')
const repoDetails = require('../constants/repoList')
const cloneRepository = require('../utils/cloneRepo')

const projectName = process.argv[2]

console.log(projectName)

const cleanup = () => {
    console.log('Cleaning up.')
    cp.execSync(`git checkout -- packages/*/package.json`)
}

const handleExit = () => {
    cleanup()
    console.log('Exiting without error.')
    process.exit()
}

const handleError = (e) => {
    console.error('ERROR! An error was encountered while executing')
    console.error(e)
    cleanup()
    console.log('Exiting with error.')
    process.exit(1)
}

process.on('SIGINT', handleExit)
process.on('uncaughtException', handleError)

console.log('Checking the git status...')

const gitStatus = isGitAvailable()

if (gitStatus) {
    console.log('Git already initialized')
} else {
    console.log('Please install git')
}

console.log('Cloning mono repo...')

cloneRepository({ repoUrl: repoDetails.monoRepo.repoUrl })

console.log('.....Initializing Your Project')

shell.mv(repoDetails.monoRepo.repoName, projectName)

console.log('Project Initialized successfully....')


