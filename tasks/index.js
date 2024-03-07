'use strict';

const cp = require('child_process');
const shell = require('shelljs');
const isGitAvailable = require('../utils/checkingGitAvailability');
const repoDetails = require('../constants/repoList');
const cloneRepository = require('../utils/cloneRepo');
const fs = require('fs').promises;

const projectName = process.argv[2];
const basePath = `${projectName}/platforms/mobile`;
const androidBasePath = `${basePath}/android/app`;
const iosBasePath = `${basePath}/ios`

const settingUpBaseFolder = async () => {
    await replaceStringInFile(`${projectName}/packages/shared/package.json`, 'monorepo', projectName);
    await replaceStringInFile(`${basePath}/app.json`, 'mobile', projectName);
    await replaceStringInFile(`${basePath}/index.js`, 'monorepo', `${projectName}`);
};


const settingUpAndroid = async () => {
    await replaceStringInFile(`${androidBasePath}/build.gradle`, 'mobile', `${projectName}`);
    await replaceStringInFile(`${basePath}/android/settings.gradle`, 'mobile', `${projectName}`);
    await replaceStringInFile(`${androidBasePath}/src/main/res/values/strings.xml`, 'mobile', `${projectName}`);
};

const settingUpIOS = async () => {
    await replaceStringInFile(`${iosBasePath}/Podfile`, 'mobile', projectName);
    await replaceStringInFile(`${iosBasePath}/mobile/AppDelegate.mm`, 'mobile', projectName);
    await replaceStringInFile(`${iosBasePath}/mobile/info.plist`, 'mobile', projectName);
    await replaceStringInFile(`${iosBasePath}/mobile/LaunchScreen.storyboard`, 'mobile', projectName);
    await replaceStringInFile(`${iosBasePath}/mobile.xcodeproj/xcshareddata/xcschemes/mobile.xcscheme`, 'mobile', projectName);
    await replaceStringInFile(`${iosBasePath}/mobile.xcodeproj/project.pbxproj`, 'mobile', projectName);
    await replaceStringInFile(`${iosBasePath}/mobile.xcworkspace/contents.xcworkspacedata`, 'mobile', projectName);
    await replaceStringInFile(`${iosBasePath}/mobileTests/mobileTests.m`, 'mobile', projectName);
}

const changeFolderName = async () => {
    shell.cd(`${androidBasePath}/src/main/java/com`);
    shell.mv('mobile', projectName);
    shell.cd('-')
    shell.cd(`${iosBasePath}`)
    shell.mv('mobile', projectName);
    shell.mv('mobile.xcodeproj', `${projectName}.xcodeproj`);
    shell.mv('mobile.xcworkspace', `${projectName}.xcworkspace`);
    shell.mv('mobileTests', projectName);
    shell.cd('..')
    shell.cd('..')
}

const settingUpWeb = async () => {
    await replaceStringInFile(`${projectName}/platforms/web/src/index.tsx`, 'monorepo', `${projectName}`);
}

const replaceStringInFile = async (filePath, searchString, replaceString) => {
    try {
        let data = await fs.readFile(filePath, 'utf8');
        const updatedContent = data.replace(new RegExp(searchString, 'g'), replaceString);
        await fs.writeFile(filePath, updatedContent, 'utf8');
    } catch (err) {
        console.error("Error reading/writing file:", err);
    }
};

const cleanup = () => {
    console.log('Cleaning up.');
    cp.execSync(`git checkout -- packages/*/package.json`);
};

const handleExit = () => {
    cleanup();
    console.log('Exiting without error.');
    process.exit();
};

const handleError = (e) => {
    console.error('ERROR! An error was encountered while executing');
    console.error(e);
    cleanup();
    console.log('Exiting with error.');
    process.exit(1);
};

process.on('SIGINT', handleExit);
process.on('uncaughtException', handleError);

console.log('Checking the git status...');

const gitStatus = isGitAvailable();

if (gitStatus) {
    console.log('Git already initialized');
} else {
    console.log('Please install git');
}

console.log('Cloning mono repo...');

cloneRepository({ repoUrl: repoDetails.monoRepo.repoUrl });

console.log('.....Initializing Your Project');

shell.mv(repoDetails.monoRepo.repoName, projectName)

setTimeout(async () => {
    await settingUpBaseFolder();
    await settingUpWeb();
    await settingUpAndroid();
    await settingUpIOS();
    await changeFolderName();

    await new Promise((resolve) => {
        setTimeout(async () => {
            shell.exec('yarn', async () => {
                const files = shell.ls()
                console.log({ files })
                shell.exec('yarn pod', async () => {
                    console.log('Project Initialized successfully....');
                    console.log('...Please update the name in the following files');
                    console.log(`${androidBasePath}/src/main/java/com/${projectName}/MainActivity.kt`);
                    console.log(`com.mobile ---> com.${projectName}`);
                    console.log(`override fun getMainComponentName(): String = "mobile" ---> override fun getMainComponentName(): String = ${projectName}`);
                    console.log(`${androidBasePath}/src/main/java/com/${projectName}/MainApplication.kt`);
                    console.log(`com.mobile ---> com.${projectName}`);
                })
                resolve();
            });
        }, 2000);

    });

}, 2000);
