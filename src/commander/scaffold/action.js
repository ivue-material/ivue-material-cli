const utils = require('../../lib/utils')
const locals = require('../../locals')();
const log = require('../../lib/utils/log');
const scaffold = require('../../lib/scaffold');
const formQ = require('./formQuestion');
const ora = require('ora');


module.exports = async function (conf) {
    // 检测当前网络环境
    let isNetWorkOk = await utils.isNetworkConnect();

    // 离线提示
    if (!isNetWorkOk) {
        log.error(locals.NETWORK_DISCONNECT);
        log.error(locals.NETWORK_DISCONNECT_SUG);
        return;
    }

    log.info(locals.WELECOME);
    log.info(locals.GREETING_GUIDE + '\n');

    // 初始化过程的6个步骤

    // 第一步：从云端配置获取 Meta 配置。确定将要下载的框架和模板 lish
    let spinner = ora(locals.LOADING_FROM_CLOUD + '...');
    spinner.start();
    let metaSchema = await scaffold.getMetaSchema();
    spinner.stop();

    // 第二步：等待用户选择将要下载的框架和模板
    let metaParams = await formQ(metaSchema);

};
