const fs = require('fs');
const fsPromises = require('fs/promises');
const path = require('path');
var exec = require('child_process').exec;

const scriptName = 'applovinQualityServiceSetup.rb';

async function execApplovinUninstallScript(path) {
    return new Promise((resolve, reject) => {
        exec(`cd ${path} && ruby ${scriptName} uninstall`, function (error, stdout, stderr) {
            console.log('stdout: ' + stdout);
            console.log('stderr: ' + stderr);

            if (error !== null) {
                console.error('exec error: ' + error);
                reject(error);
            } else {
                resolve();
            }
        });
    });
}

module.exports = async function(context) {
    const iosPath = path.join(context.opts.projectRoot, 'platforms/ios');

    try {
        console.log('Applovin start removing');
        if (!fs.existsSync(`${iosPath}/${scriptName}`)) {
            console.log('Applovin copying quality service setup script');
            await fsPromises.copyFile(`${__dirname}/${scriptName}`, `${iosPath}/${scriptName}`);
        }

        console.log('Applovin running uninstall script');
        await execApplovinUninstallScript(iosPath);

        console.log('Applovin removing setup script');
        await fsPromises.rm(`${iosPath}/${scriptName}`);

        console.log('Applovin removing quality service');
        await fsPromises.rmdir(`${iosPath}/AppLovinQualityService`, { recursive: true });

        console.log('Applovin script completed');
    } catch (error) {
        console.error('Applovin setup script error', error);
        throw 'Applovin setup script error';
    }
}