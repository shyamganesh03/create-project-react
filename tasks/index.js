#!/usr/bin/env node

const shell = require('shelljs');
const isGitAvailable = require('../utils/checkingGitAvailability');
const repoDetails = require('../constants/repoList');
const cloneRepository = require('../utils/cloneRepo');
const checkNodeInstalled = require("../utils/checkNodeInstalled");
const fs = require('fs').promises;

const defaultFolderName = repoDetails.monoRepo.repoName
const projectName = process.argv[2];
const basePath = `${defaultFolderName}/platforms/mobile`;
const androidBasePath = `${basePath}/android/app`;
const iosBasePath = `${basePath}/ios`

if (!projectName) {
    console.log('---------------------')
    console.log('please provide a project name to execute')
    console.log('---------------------')
    process.exit(1);
}

const settingUpBaseFolder = async () => {
    await replaceStringInFile(`${defaultFolderName}/packages/shared/package.json`, 'monorepo', projectName);
    await replaceStringInFile(`${basePath}/app.json`, 'mobile', projectName);
    await replaceStringInFile(`${basePath}/index.js`, 'monorepo', `${projectName}`);
};


const settingUpAndroid = async () => {
    await replaceStringInFile(`${androidBasePath}/build.gradle`, 'mobile', `${projectName}`);
    await replaceStringInFile(`${basePath}/android/settings.gradle`, 'mobile', `${projectName}`);
    await replaceStringInFile(`${androidBasePath}/src/main/res/values/strings.xml`, 'mobile', `${projectName}`);
    await replaceStringInFile(`${androidBasePath}/src/main/java/com/mobile/MainActivity.kt`, 'com.mobile', `com.${projectName}`);
    await replaceStringInFile(`${androidBasePath}/src/main/java/com/mobile/MainActivity.kt`, 'mobile', `${projectName}`);
    await replaceStringInFile(`${androidBasePath}/src/main/java/com/mobile/MainApplication.kt`, 'com.mobile', `com.${projectName}`);
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
    await replaceStringInFile(`${defaultFolderName}/platforms/web/src/index.tsx`, 'monorepo', `${projectName}`);
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

const checkGitStatus = async () => {
    console.log('Checking the git status...');

    const gitStatus = isGitAvailable();

    if (gitStatus) {
        console.log('Git already initialized');
    } else {
        console.log('Please install git');
        process.exit(1);
    }
}

const setUpProject = async () => {
    console.log('Cloning Repo...');

    cloneRepository({ repoUrl: repoDetails.monoRepo.repoUrl });

    console.log('.....Initializing Your Project');


    setTimeout(async () => {
        await settingUpBaseFolder();
        await settingUpWeb();
        await settingUpAndroid();
        await settingUpIOS();
        await changeFolderName();

        await new Promise((resolve) => {
            setTimeout(async () => {
                shell.exec('yarn', async () => {
                    shell.exec('yarn pod', async () => {
                        shell.cd('..')
                        shell.cd('..')
                        shell.mv(defaultFolderName, projectName)
                        console.log('Project Initialized successfully....');
                    })
                    resolve();
                });
            }, 2000);

        });

    }, 2000);
}

console.log('Checking node version...');

// Check node version
checkNodeInstalled()
    .then(async (version) => {
        if (version < 18) {
            console.log(`Your current node version:`, version);
            console.log('please install node >=18');
            process.exit(1);
        } else {
            await checkGitStatus()
            await setUpProject()
        }

    })
    .catch(error => {
        console.log(`Your current node version:`, version);
        console.error('node is not installed or an error occurred:', error.message);
        process.exit(1);
    });






