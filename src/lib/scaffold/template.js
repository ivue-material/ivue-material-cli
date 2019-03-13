/**
 * @file templates modules
 */
const getMeta = require('./getMeta');
const store = require('./store');
const conf = require('./config');
const path = require('path');
const Ajv = require('ajv');
const schema = require('./schema');
const fs = require('fs-extra');
const axios = require('axios');
const compressing = require('compressing');
const download = require('download-git-repo'); // 下载并提取git仓库，用于下载项目模板

const locals = require('../../locals')();

/**
 * 通过指定框架名和模版名从服务器上拉取模版（要求在模版 relase 的时候注意上传的 CDN 路径）
 *
 * @param {string} framework 框架名称
 * @param {string} template 模版名称
 * @param {string} targetPath 模版下载后存放路径
 */

async function downloadTemplateFromCloud (framework, template, targetPath) {
    const outputFilename = path.resolve(targetPath, 'template.zip');

    // const outputFilename = path.resolve(targetPath, 'template.tar.gz');

    // existsSync:  如果路径存在，则返回 true，否则返回 false。
    // removeSync 删除文件、目录
    fs.existsSync(targetPath) && fs.removeSync(targetPath);
    // 确保目录存在。如果目录结构不存在，则创建它
    fs.mkdirsSync(targetPath);

    framework = (framework || 'vue').toLowerCase();
    template = (template || 'basic').toLowerCase();

    try {
        // 请求模板

        // 是否使用react模板
        // await setTimeout(() => {
        // let gitUrl = 'https://github.com:lavas-project/lavas-template-vue#release-basic';
        // await download(gitUrl, outputFilename, { clone: true }, err => {
        //     if (err) {
        //         console.log(err)
        //     }
        //     else {
        //         console.log('??')
        //         spinner.stop()

        //         store.set('storeDir', targetPath);

        //         // 读取文件
        //         let templateConfigContent = fs.readFileSync(path.resolve(targetPath, 'meta.json'), 'utf-8');
        //         let templateConfig = JSON.parse(templateConfigContent);

        //         store.set('templateConfig', templateConfig);

        //         return templateConfig
        //     }

        // });

        // let result = await axios.request({
        //     responseType: 'arraybuffer',
        //     url: 'https://codeload.github.com/lavas-project/lavas-template-vue/zip/release-basic',
        //     method: 'get',
        //     headers: {
        //         'Content-Type': 'application/zip'
        //     }
        // });

        // // 写入文件
        // fs.writeFileSync(outputFilename, result.data);

        // // 解压缩是反响过程，接口都统一为 uncompress
        // await compressing.tgz.uncompress(outputFilename, targetPath);
        // fs.removeSync(outputFilename);

        let result = await axios.request({
            responseType: 'arraybuffer',
            url: 'https://codeload.github.com/lavas-project/lavas-template-vue/zip/release-basic',
            method: 'get',
            headers: {
                'Content-Type': 'application/zip'
            }
        });

        fs.writeFileSync(outputFilename, result.data);

        // 解压缩是反响过程，接口都统一为 uncompress
        await compressing.zip.uncompress(outputFilename, targetPath);
        fs.removeSync(outputFilename);
    }
    catch (e) {
        throw new Error(locals.DOWNLOAD_TEMPLATE_ERROR);
    }
};


/**
 * 下载一个指定的模版
 *
 * @param  {Object} metaParams  导出模版所需字段, 从 mataSchema 中得出
 * @return {Objecy}             导出的结果
 */
exports.download = async function (metaParams = {}) {
    let { framework, template, version } = await getTemplateInfo(metaParams);
    let storeDir = path.resolve(
        conf.LOCAL_TEMPLATES_DIR,
        framework.value, template.value + '_' + version
    )

    let ajv = new Ajv({ allErrors: true });
    let metaJsonSchema = store.get('metaJsonSchema') || await schema.getMetaJsonSchema();
    let validate = ajv.compile(metaJsonSchema);
    let valid = validate(metaParams);

    if (!valid) {
        throw new Error(JSON.stringify(validate.errors));
    }

    //  通过指定框架名和模版名从服务器上拉取模版
    await downloadTemplateFromCloud(framework.value, template.value, storeDir);

    store.set('storeDir', storeDir);

    // 获取文件夹名称
    const files = fs.readdirSync(storeDir)

    let templateConfigContent = fs.readFileSync(path.resolve(`${storeDir}/${files}`, 'meta.json'), 'utf-8');

    let templateConfig = JSON.parse(templateConfigContent);

    store.set('templateConfig', templateConfig);

    return templateConfig;
}

/**
 * 获取模版信息
 *
 * @param  {Object} metaParam 元参数
 * @return {Object} framework 和 template 信息
 */
async function getTemplateInfo (metaParam) {
    try {
        let meta = await getMeta();
        let frameworkValue = metaParam.framework || meta.defaults.framework || 'vue';
        let templateValue = metaParam.template || meta.defaults.template || 'template'
        let framework = meta.frameworks.filter(item => item.value === frameworkValue)[0];
        let template = framework.subList.template.filter(item => item.value === templateValue)[0];
        let version = meta.version;

        store.set('framework', framework);
        store.set('template', template);
        store.set('version', version);

        return {
            framework,
            template,
            version
        };
    }
    catch (e) {
        // 如果这一步出错了，只能说明是 BOS 上的 Meta 配置格式错误。。
        throw new Error(locals.META_TEMPLATE_ERROR);
    }
}
