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
    packageConfig.devDependencies['vuex'] = '^3.1.1';

    // 转换字符串
    packageConfig = JSON.stringify(packageConfig, null, 4);
    packageConfig = etplCompile.compile(packageConfig)();

    // 重新写入文件
    fs.writeFileSync(path.resolve(storeDir, 'package.json'), packageConfig);
}


/**
 * store dir
 *
 * @param {String} storeDir 文件根目录
 * @param {String} currentDir 当前文件目录
 * @param {Function} etplCompile 字符串转换
 * @param {Array} params 需要设置的参数
 */
function setStore (storeDir, currentDir, etplCompile, params) {
    let storeUrl = `${storeDir}/src/store`;

    let _currentDir;

    // 是否选择了 typescript
    if (params.indexOf('typescript') > -1) {
        _currentDir = `${currentDir}/storets`;
    }
    else {
        _currentDir = `${currentDir}/store`
    }

    // 创建 store 文件夹
    fs.mkdirSync(path.resolve(storeUrl));

    // 复制 store 文件
    copyFile.copy(_currentDir, storeUrl);
}

/**
 * Hello.vue
 *
 * @param {String} storeDir 文件根目录
 * @param {String} currentDir 当前文件目录
 * @param {Function} etplCompile 字符串转换
 */
function setHelloVue (storeDir, currentDir, etplCompile) {

    // 读取文件
    let helloVue = fs.readFileSync(path.resolve(`${currentDir}/components`, 'Hello.vue'), 'utf-8');

    helloVue = etplCompile.compile(helloVue)();

    // 重新写入文件
    fs.writeFileSync(path.resolve(`${storeDir}/src/components`, 'Hello.vue'), helloVue);
}

/**
 * 修改相关文件
 *
 * @param {String} storeDir 文件根目录
 * @param {Function} etplCompile 字符串转换
 * @param {String} params 需要设置的参数
 */
exports.setFile = async function (storeDir, etplCompile, params) {
    const currentDir = __dirname + '/code/';

    // package.json
    setPackConfig(storeDir, currentDir, etplCompile);

    // store dir
    setStore(storeDir, currentDir, etplCompile, params);

    // Hello.vue
    setHelloVue(storeDir, currentDir, etplCompile);
}
