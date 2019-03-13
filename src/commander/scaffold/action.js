const utils = require('../../lib/utils')
const locals = require('../../locals')();
const log = require('../../lib/utils/log');
const scaffold = require('../../lib/scaffold');
const formQ = require('./formQuestion');
const ora = require('ora');

let cwd = process.cwd();

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

    // 第三步：通过用户选择的框架和模板，下载模板
    spinner.start();
    let templateConf = await scaffold.download(metaParams);
    spinner.stop();

    // 第四步：根据下载的模板的 meta.json 获取当前模板所需要用户输入的字段 schema
    let schema = await scaffold.getSchema(templateConf);

    // 第五步：等待用户输入 schema 所预设的字段信息
    let params = await formQ(schema);

    // 第六步：渲染模板，并导出到指定的文件夹(当前文件夹)
    let projectTargetPath = path.resolve(params.dirPath || cwd, params.name);
    params = Object.assign({}, metaParams, params);

    // 测试某个路径下的文件是否存在
    let isPathExist = await fs.pathExists(projectTargetPath);

};
