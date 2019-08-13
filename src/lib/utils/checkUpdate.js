
/**
 * 检测是否需要更新版本
 */

'use strict';

const path = require('path');
const fs = require('fs-extra');
const axios = require('axios');
const semver = require('semver');
const log = require('./log');
const locals = require('../../locals')();

// 获取项目根目录
const getHome = require('./index').getHome;

const TIME_RANGE = 24 * 60 * 60 * 1000;
const NPM_REGISTRY = 'https://registry.npm.taobao.org/ivue-material-cli';


async function requestPackageInfo () {
    try {
        let packageInfo = await axios({
            url: NPM_REGISTRY,
            timeout: 1000
        });

        // npm 上的版本号
        let lastVersion = packageInfo.data['dist-tags'].latest;

        // 当前版本号
        let curVersion = require('../../../package.json').version;

        if (semver.gt(lastVersion, curVersion)) {
            log.info(log.chalk.bold.yellow(locals.UPDATE_TIPS));
        }
    }
    catch (e) { }
}

module.exports = async function () {
    // 检测更新路径
    let updateCheckerInfoPath = path.resolve(getHome(), '.updateChecker.txt');
    // true如果路径存在false则返回，否则返回。
    if (fs.existsSync(updateCheckerInfoPath)) {
        // 读取文件
        let updateCheckerInfo = fs.readFileSync(updateCheckerInfoPath, 'utf-8');

        if (Date.now() - (+updateCheckerInfo) >= TIME_RANGE) {
            await requestPackageInfo();
            fs.writeFileSync(updateCheckerInfoPath, Date.now() + '');
        }
    }
    else {
        let dirname = path.dirname(updateCheckerInfoPath);
        fs.existsSync(dirname) && fs.mkdirpSync(dirname);
        fs.writeFileSync(updateCheckerInfoPath, Date.now() + '');

        await requestPackageInfo();
    }

};
