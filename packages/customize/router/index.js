const fs = require('fs-extra');
const path = require('path');


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
    packageConfig.devDependencies['vue-router'] = '^3.1.2';

    // 转换字符串
    packageConfig = JSON.stringify(packageConfig, null, 4);
    packageConfig = etplCompile.compile(packageConfig)();

    // 重新写入文件
    fs.writeFileSync(path.resolve(storeDir, 'package.json'), packageConfig);
}

/**
 * router.js
 *
 * @param {String} storeDir 文件根目录
 * @param {String} currentDir 当前文件目录
 * @param {Function} etplCompile 字符串转换
 */
function setRouterJs (storeDir, currentDir, etplCompile) {
    // 读取文件
    let routerJs = fs.readFileSync(path.resolve(currentDir, 'router.js'), 'utf-8');

    routerJs = etplCompile.compile(routerJs)();

    // 重新写入文件
    fs.writeFileSync(path.resolve(`${storeDir}/src`, 'router.js'), routerJs);
}


/**
 * App.vue
 *
 * @param {String} storeDir 文件根目录
 * @param {String} currentDir 当前文件目录
 * @param {Function} etplCompile 字符串转换
 */
function setAppVue (storeDir, currentDir, etplCompile) {

    // 读取文件
    let appVue = fs.readFileSync(path.resolve(currentDir, 'App.vue'), 'utf-8');

    appVue = etplCompile.compile(appVue)();

    // 重新写入文件
    fs.writeFileSync(path.resolve(`${storeDir}/src`, 'App.vue'), appVue);
}

/**
 * Home.vue
 *
 * @param {String} storeDir 文件根目录
 * @param {String} currentDir 当前文件目录
 * @param {Function} etplCompile 字符串转换
 */
function setHomeVue (storeDir, currentDir, etplCompile) {

    // 创建 views 文件夹
    fs.mkdirSync(path.resolve(`${storeDir}/src/views`));

    // 读取文件
    let helloVue = fs.readFileSync(path.resolve(currentDir, 'Home.vue'), 'utf-8');

    helloVue = etplCompile.compile(helloVue)();


    // 写入文件
    fs.writeFileSync(path.resolve(`${storeDir}/src/views`, 'Home.vue'), helloVue);
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
    // router.js
    setRouterJs(storeDir, currentDir, etplCompile);
    // App.vue
    setAppVue(storeDir, currentDir, etplCompile);
    // Home.vue
    setHomeVue(storeDir, currentDir, etplCompile)
}
