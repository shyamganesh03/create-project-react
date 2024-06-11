#!/usr/bin/env node

const shell = require('shelljs');
const isGitAvailable = require('../utils/checkingGitAvailability');
const repoDetails = require('../constants/repoList');
const cloneRepository = require('../utils/cloneRepo');
const checkNodeInstalled = require("../utils/checkNodeInstalled");
const fs = require('fs').promises;

const defaultFolderName = repoDetails.monoRepo.repoName
const projectName = process.argv[2];
const basePath = `${defaultFolderName}/apps/monoRepo`;
const androidBasePath = `${basePath}/android/app`;
const iosBasePath = `${basePath}/ios`

if (!projectName) {
    console.log('---------------------')
    console.log('please provide a project name to execute')
    console.log('---------------------')
    process.exit(1);
}

const settingUpBaseFolder = async () => {
    await replaceStringInFile(`${defaultFolderName}/packages/shared/package.json`, 'monoRepo', projectName);
    await replaceStringInFile(`${basePath}/app.json`, 'monoRepo', projectName);
    await replaceStringInFile(`${basePath}/index.js`, 'monoRepo', `${projectName}`);
};


const settingUpAndroid = async () => {
    await replaceStringInFile(`${androidBasePath}/build.gradle`, 'monoRepo', `${projectName}`);
    await replaceStringInFile(`${basePath}/android/settings.gradle`, 'monoRepo', `${projectName}`);
    await replaceStringInFile(`${androidBasePath}/src/main/res/values/strings.xml`, 'monoRepo', `${projectName}`);
    await replaceStringInFile(`${androidBasePath}/src/main/java/com/monoRepo/MainActivity.kt`, 'com.monoRepo', `com.${projectName}`);
    await replaceStringInFile(`${androidBasePath}/src/main/java/com/monoRepo/MainActivity.kt`, 'monoRepo', `${projectName}`);
    await replaceStringInFile(`${androidBasePath}/src/main/java/com/monoRepo/MainApplication.kt`, 'com.monoRepo', `com.${projectName}`);
};

const settingUpIOS = async () => {
    await replaceStringInFile(`${iosBasePath}/Podfile`, 'monoRepo', projectName);
    await replaceStringInFile(`${iosBasePath}/monoRepo/AppDelegate.mm`, 'monoRepo', projectName);
    await replaceStringInFile(`${iosBasePath}/monoRepo/info.plist`, 'monoRepo', projectName);
    await replaceStringInFile(`${iosBasePath}/monoRepo/LaunchScreen.storyboard`, 'monoRepo', projectName);
    await replaceStringInFile(`${iosBasePath}/monoRepo.xcodeproj/xcshareddata/xcschemes/monoRepo.xcscheme`, 'monoRepo', projectName);
    await replaceStringInFile(`${iosBasePath}/monoRepo.xcodeproj/project.pbxproj`, 'monoRepo', projectName);
    await replaceStringInFile(`${iosBasePath}/monoRepo.xcworkspace/contents.xcworkspacedata`, 'monoRepo', projectName);
    await replaceStringInFile(`${iosBasePath}/mobileTests/mobileTests.m`, 'monoRepo', projectName);
}

const changeFolderName = async () => {
    shell.cd(`${androidBasePath}/src/main/java/com`);
    shell.mv('monoRepo', projectName);
    shell.cd('-')
    shell.cd(`${iosBasePath}`)
    shell.mv('monoRepo', projectName);
    shell.mv('monoRepo.xcodeproj', `${projectName}.xcodeproj`);
    shell.mv('monoRepo.xcworkspace', `${projectName}.xcworkspace`);
    shell.mv('mobileTests', projectName);
    shell.cd('..')
    shell.cd('..')
}

const settingUpWeb = async () => {
    await replaceStringInFile(`${defaultFolderName}/apps/web/src/index.tsx`, 'monoRepo', `${projectName}`);
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






