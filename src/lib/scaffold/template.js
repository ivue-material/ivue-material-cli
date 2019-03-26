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
// const download = require('download-git-repo'); // 下载并提取git仓库，用于下载项目模板
// ETPL是一个强复用，灵活，高性能的JavaScript的模板引擎，适用于浏览器端或节点环境中视图的生成
const etpl = require('etpl');
// Match files using the patterns the shell uses, like stars and stuff.
const glob = require('glob');
// 用于存档生成的流式界面
const archiver = require('archiver');

const locals = require('../../locals')();
const chalk = require('chalk'); // 给终端的字体添加样式

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
    template = (template || 'basic').toLowerCase().replace(/\s/,'-');
    
    try {
        // 请求模板
        let result = await axios.request({
            responseType: 'arraybuffer',
            url: 'https://codeload.github.com/qq282126990/webpack/zip/release-' + template,
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
 * 渲染 template 里面的所有文件
 *
 * @param  {Object} params    收集的用户输入字段
 * @param  {string} tmpStoreDir  临时文件夹存储路径
 * @return {Promise}          渲染 promise
 */
function renderTemplate (params, tmpStoreDir) {
    let templateConfig = store.get('templateConfig');
    let dirPath = params.dirPath || process.cwd();
    // 模板文件渲染
    let etplCompile = new etpl.Engine(templateConfig.etpl || conf.ETPL);

    // 把指定的开发者不需要的文件和文件夹都删掉
    deleteFilter(tmpStoreDir, templateConfig.exportsIgnores);

    return new Promise((resolve, reject) => glob(
        '**/*',
        {
            // 要搜索的当前工作目录
            cwd: tmpStoreDir,
            // 添加模式或glob模式数组以排除匹配。注意：无论其他设置如何，ignore模式始终处于dot:true模式状态。
            ignore: (templateConfig.renderIgnores || []).concat(...conf.DEFAULT_RENDER_IGNORES)
        },
        (err, files) => {
            files.forEach((file) => {
                // 文件路径
                let filePath = path.resolve(tmpStoreDir, file);
                // 对象提供有关文件的信息。
                // 如果 fs.Stats 对象描述常规文件，则返回 true。
                if (fs.statSync(filePath).isFile()) {
                    let content = fs.readFileSync(filePath, 'utf8');

                    // 这里可以直接通过外界配置的规则，重新计算出一份数据，只要和 template 里面的字段对应上就好了
                    let extDataTpls = templateConfig.extData || {};
                    let extData = {};
                    let commonData = conf.COMMON_DATA;

                    Object.keys(extDataTpls).forEach((key) => {
                        extData[key] = etplCompile.compile(`${extDataTpls[key]}`)(params);
                    });

                    let renderData = Object.assign({}, params, extData, commonData);
                    console.log(filePath)
                    let afterCon = etplCompile.compile(content)(renderData);

                    fs.writeFileSync(filePath, afterCon);
                }
            });

            // addPackageJson(tmpStoreDir, params);

            if (params.isStream) {
                //  设置压缩级别
                let archive = archiver('zip', { zlib: { level: 9 } });
                let tmpZipPath = path.resolve(tmpStoreDir, '..', 'zip');
                // 创建一个文件以将归档数据流式传输到。
                let output = fs.createWriteStream(tmpZipPath);

                // 将 归档数据管道传输到文件
                archiver.pipe(output);
                // 从子目录追加文件并在归档中命名为  params.name
                archive.directory(tmpStoreDir, params.name);
                //  完成归档（即我们已完成附加文件，但流必须完成）
                //  'close'，'end'或'finish'可能在调用此方法后立即触发，因此请事先注册
                archive.finalize().on('finish', () => resolve(fs.createReadStream(tmpZipPath)));
            }
            else {
                fs.copySync(tmpStoreDir, dirPath);
                resolve(dirPath);
            }
        }
    ));
}

/**
 * 给 工程指定 package.json 文件
 *
 * @param {string} dir    指定添加 package.json 文件的目录
 * @param {Object} params 渲染的参数
 */
// function addPackageJson (dir, params) {
//     let templateConfig = store.get('templateConfig');
//     let version = store.get('version') || '2';
//     let etplCompile = new etpl.Engine(templateConfig.etpl || conf.ETPL);
//     let packageJson = templateConfig;

//     // packageJson.ivue = {
//     //     core: templateConfig.core || 'ivue-core-vue',
//     //     version
//     // };

//     let fileName = 'package.json';
//     let filePath = path.resolve(dir, fileName);

//     let fileContent = (packageJson && typeof packageJson === 'object') ?
//         JSON.stringify(packageJson, null, 4)
//         : fs.readFileSync(path.resolve(__dirname, 'templates', 'package.json'), 'utf8');

//     // 如果没有在模版中指定 package.json 的时候，就需要使用默认的文件了
//     params.coreName = templateConfig.core || 'ivue-core-name';

//     console.log(params)
//     fileContent = etplCompile.compile(fileContent)(params);

//     fs.writeFileSync(filePath, fileContent);
// }

/**
 * 删除某个目录中的指定文件或文件夹
 *
 * @param {string} dir 根目录
 * @param {*} ignores 过滤的文件或文件夹数组
 */
function deleteFilter (dir, ignores = []) {
    ignores.concat(...conf.DEFAULT_EXPORTS_IGNORES).forEach((target) => {
        let targetPath = path.resolve(dir, target);
        // 如果路径存在，则返回 true，否则返回 false。
        //  删除文件
        fs.existsSync(targetPath) && fs.removeSync(targetPath);
    })
}

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

    // 获取文件夹名称
    const files = fs.readdirSync(storeDir);

    store.set('storeDir', `${storeDir}/${files}`);

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


/**
 * 渲染指定的模板模版
 *
 * @param {Object} params 收集到的用户输入的参数
 * @return {*} 导出的结果
 */
exports.render = async function (params) {
    let templateConfig = store.get('templateConfig') || await this.download(params);
    let tmpStoreDir = path.resolve(conf.LOCAL_TEMPLATES_DIR, `${Date.now()}`);
    let storeDir = store.get('storeDir');
    let ajv = new Ajv({ allErrors: true });
    let jsonSchema = schema.getMetaJsonSchema(templateConfig);
    let validate = ajv.compile(jsonSchema);
    let valid = validate(params);

    if (!valid) {
        throw new Error(JSON.stringify(validate.errors));
    }

    try {
        // 如果路径存在，则返回 true，否则返回 false
        if (!fs.existsSync(storeDir)) {
            await this.download(params);
        }
        else {
        }

        // 将创建的目录路径
        fs.mkdirSync(tmpStoreDir);

        console.log(storeDir)
        // 拷贝文件
        fs.copySync(storeDir, tmpStoreDir);

        //  渲染 template 里面的所有文件
        let renderResult = await renderTemplate(params, tmpStoreDir);

        // 删除文件
        fs.removeSync(tmpStoreDir);

        return renderResult;
    }
    catch (e) {
        throw new Error(locals.RENDER_TEMPLATE_ERROR);
    }
}
