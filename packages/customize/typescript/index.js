const fs = require('fs-extra');
const path = require('path');
const copyFile = require('../../cli/src/lib/utils/copyFile');

/**
 * package.json
 *
 * @param {String} storeDir 文件根目录
 * @param {String} currentDir 当前文件目录
 * @param {Function} etplCompile 字符串转换
 */
function setPackConfig (storeDir, currentDir, etplCompile) {
    // 读取文件
    let packageConfig = fs.readFileSync(path.resolve(storeDir, 'package.json'), 'utf-8');
    // 插入版本号
    packageConfig = JSON.parse(packageConfig)
    packageConfig.devDependencies['typescript'] = '^3.5.3';
    packageConfig.devDependencies['ts-loader'] = '^6.0.4';
    packageConfig.devDependencies['fork-ts-checker-webpack-plugin'] = '^1.5.0';

    // 转换字符串
    packageConfig = JSON.stringify(packageConfig, null, 4);
    packageConfig = etplCompile.compile(packageConfig)();

    // 重新写入文件
    fs.writeFileSync(path.resolve(storeDir, 'package.json'), packageConfig);
}

/**
 * tsconfig.json
 *
 * @param {String} storeDir 文件根目录
 * @param {String} currentDir 当前文件目录
 * @param {Function} etplCompile 字符串转换
 */
function setTsconfig (storeDir, currentDir, etplCompile) {
    // 读取文件
    let tsconfig = fs.readFileSync(path.resolve(`${currentDir}`, 'tsconfig.json'), 'utf-8');

    tsconfig = etplCompile.compile(tsconfig)();

    // 重新写入文件
    fs.writeFileSync(path.resolve(storeDir, 'tsconfig.json'), tsconfig);
}



/**
 * src dir
 *
 * @param {String} storeDir 文件根目录
 * @param {String} currentDir 当前文件目录
 * @param {Function} etplCompile 字符串转换
 */
function setSrc (storeDir, currentDir, etplCompile) {
    let storeUrl = `${storeDir}/src`;

    // 删除 main.js
    fs.unlinkSync(path.resolve(`${storeDir}/src`, 'main.js'));

    // 复制 src 文件
    copyFile.copy(`${currentDir}/src`, storeUrl);
}


/**
 * webpack.config 配置
 *
 * @param {String} storeDir 文件根目录
 * @param {String} currentDir 当前文件目录
 * @param {Function} etplCompile 字符串转换
 */
function setWebpackConfig (storeDir, currentDir, etplCompile) {
    // 读取文件
    let webpackConfig = fs.readFileSync(path.resolve(`${currentDir}`, 'webpack.config.js'), 'utf-8');

    webpackConfig = etplCompile.compile(webpackConfig)();

    // 重新写入文件
    fs.writeFileSync(path.resolve(`${storeDir}/build`, 'webpack.config.js'), webpackConfig);
}


/**
 * 修改相关文件
 *
 * @param {String} storeDir 文件根目录
 * @param {Function} etplCompile 字符串转换
 */
exports.setFile = async function (storeDir, etplCompile) {
    const currentDir = __dirname + '/code/';

    // package.json
    setPackConfig(storeDir, currentDir, etplCompile);

    // tsconfig.json
    setTsconfig(storeDir, currentDir, etplCompile);

    // src dir
    setSrc(storeDir, currentDir, etplCompile);

    // webpack.config 配置
    setWebpackConfig(storeDir, currentDir, etplCompile);
}
