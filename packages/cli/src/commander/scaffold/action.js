const utils = require('../../lib/utils')
const locals = require('../../locals')();
const log = require('../../lib/utils/log');
const scaffold = require('../../lib/scaffold');
const formQ = require('./formQuestion');
const ora = require('ora');
const path = require('path');
const fs = require('fs-extra');
const axios = require('axios');
const chalk = require('chalk'); // 给终端的字体添加样式
const symbols = require('log-symbols'); // 终端上显示出 √ 或 × 等的图标

let cwd = process.cwd();


/**
 * export  project
 *
 * @param  {Object} params params for export action
 * @param  {Object} templateConf  the config content of project
 * @param  {Object} checkboxParams  checkbox select option
 */
async function exportProject (params, templateConf, checkboxParams) {
    let spinner = ora(locals.LOADING_EXPORT_PROJECT + '...');

    spinner.start();
    await scaffold.render(params, templateConf, checkboxParams);
    spinner.stop();

    // for log beautify
    console.log('');
    log.info(locals.INIT_SUCCESS);
    log.info(locals.INIT_NEXT_GUIDE + '：\n\n'
        + log.chalk.green('cd ' + params.name + '\n'
            + 'npm install\n'
            + 'npm run serve'
        ));
    try {
        await axios('https://lavas.baidu.com/api/logger/send?action=cli&commander=init');
    }
    catch (e) { }
}

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

    let checkboxParams;
    let cssParams;
    // 只有基础模板才可以自定义选项
    if (metaParams.template === 'Basic') {
        // 获取用户选择的参数
        checkboxParams = await formQ(metaSchema.checkbox);

        // 是否选择了css
        if (checkboxParams.checkbox.indexOf('css') > -1) {
            cssParams = await formQ(metaSchema.csssProcessors);
        }
    }

    // 第三步：通过用户选择的框架和模板，下载模板
    spinner.start();
    let templateConf = await scaffold.download(metaParams, checkboxParams);
    spinner.stop();

    // 设置用户选择的参数
    // 只有基础模板才可以自定义选项
    if (metaParams.template === 'Basic') {
        await scaffold.setCheckboxParams(checkboxParams.checkbox);

        // 是否选择了css
        if (cssParams) {
            await scaffold.setCssParams(cssParams.csssProcessors);
        }
    }

    // 第四步：根据下载的模板的 meta.json 获取当前模板所需要用户输入的字段 schema
    let schema = await scaffold.getSchema(templateConf);

    // 第五步：等待用户输入 schema 所预设的字段信息
    let params = await formQ(schema);

    // 第六步：渲染模板，并导出到指定的文件夹(当前文件夹)
    let projectTargetPath = path.resolve(params.dirPath || cwd, params.name);
    params = Object.assign({}, metaParams, params);

    // 测试某个路径下的文件是否存在
    let isPathExist = await fs.pathExists(projectTargetPath);
    if (isPathExist) {
        // 错误提示项目已存在，避免覆盖原有项目
        console.log(symbols.error, chalk.red('项目已存在'));
        return;
    }
    else {
        await exportProject(params, templateConf, checkboxParams);
    }
};
