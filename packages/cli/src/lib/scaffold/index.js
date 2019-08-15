const Schema = require('./schema');
const store = require('./store');
const path = require('path');
const _ = require('lodash');
const template = require('./template');
const fs = require('fs-extra');
// ETPL是一个强复用，灵活，高性能的JavaScript的模板引擎，适用于浏览器端或节点环境中视图的生成
const etpl = require('etpl');
// 设置router配置
const routerConfig = require('../../../../customize/router');
// 设置 vuex配置
const vuexConfig = require('../../../../customize/vuex');

/**
 * 获取导出的所有的 fields （包含 default 参数）
 *
 * @param  {Object} fields  传入的 fields
 * @param  {Obejct} templateConf    模版的配置
 * @return {Object}         输出的 fields
 */
async function extendsDefaultFields (fields = {}, templateConf = {}) {
    let defaultFields = {};
    let schema = store.get('schema') || await Schema.getSchema(templateConf)

    Object.keys(schema).forEach((key) => (defaultFields[key] = schema[key].default))

    /* eslint-disable fecs-use-computed-property */
    // defaultFields.name = fields.name || 'ivue-cli'
    defaultFields.name = fields.name || 'ivue-cli';

    defaultFields.dirPath = path.resolve(process.cwd(), fields.dirPath || '', defaultFields.name);

    return _.merge({}, defaultFields, fields);
}


/**
 * 获取元 Schema - 涉及模版下载的 Schema
 *
 * @return {Promise<*>}   Meta Schema
 */
exports.getMetaSchema = async function () {
    return store.get('metaSchema') || await Schema.getMetaSchema();
}

/**
 * 通过指定的 meta 参数下载模版，下载成功后返回模板的 Schema 信息
 *
 * @param {Object} metaParams 导出参数
 * @return {*} 下载的临时路径 或者 报错对象
 */
exports.download = async function (metaParams = {}) {
    metaParams = await extendsDefaultFields(metaParams);

    return await template.download(metaParams);
}

/**
 * 获取 Schema - 涉及模版渲染的 Schema
 *
 * @param {Object} templateConf 模版自己的配置
 * @return {Promise<*>}   Schema
 */
exports.getSchema = async function (templateConf = {}) {
    if (!templateConf) {
        // 如果实在没有提前下载模板，就现用默认的参数下载一个
        templateConf = await Schema.download();
    }
    return Schema.getSchema(templateConf);
}

/**
 * 通过指定的参数渲染下载成功的模板
 *
 * @param {Object} params 导出参数
 * @param {Object} templateConf 模版的配置
 * @return {Promise<*>}   导出的结果
 */
exports.render = async function (params = {}, templateConf) {
    if (!templateConf) {
        // 如果实在没有提前下载模板，就现用默认的参数下载一个（这个模板是默认的）
        templateConf = await Schema.download();
    }

    params = await extendsDefaultFields(params, templateConf);

    return await template.render(params);
}

if (process.env.NODE_ENV === 'development') {
    console.log('Woow! You are in development!!!');
}


/**
 * 通过指定的参数渲染下载成功的模板
 *
 * @param {Array} params 需要设置的参数
 */
exports.setCheckboxParams = async function (params = []) {
    const storeDir = store.get('storeDir');
    const templateConfig = store.get('templateConfig');
    const etplCompile = new etpl.Engine(templateConfig.etpl);
    const currentDir = './packages/customize/router/code'

    params.forEach((key) => {
        // 插入路由配置
        if (key === 'router') {
            routerConfig.setFile(storeDir, etplCompile);
        }

        // 插入 vuex 配置
        if (key === 'vuex') {
            vuexConfig.setFile(storeDir, etplCompile)
        }
    });

    // 修改 main.js
    setMainJs(storeDir, currentDir, etplCompile, params);
}

/**
 * main.js
 *
 * @param {String} storeDir 文件根目录
 * @param {String} currentDir 当前文件目录
 * @param {Function} etplCompile 字符串转换
 * @param {Array} params 需要设置的参数
 */
function setMainJs (storeDir, currentDir, etplCompile, params) {

    // 模块
    let nodeModules = '';
    // 路径列表
    let urls = '';
    // 配置
    let configs = '';
    // 名字列表
    let names = '';


    params.forEach((key) => {
        // 插入路由配置
        if (key === 'router') {
            nodeModules += `${nodeModules.length === 0 ? '' : '\n'}import VueRouter from 'vue-router'`;

            urls += `${urls.length === 0 ? '' : '\n'}import router from './router'`;

            configs += `${configs.length === 0 ? '' : '\n'}Vue.use(VueRouter)`;

            names += `${names.length === 0 ? '' : '\n'}    router,`;
        }

        // 插入vuex配置
        if (key === 'vuex') {
            urls += `${urls.length === 0 ? '' : '\n'}import store from './store'`;

            names += `${names.length === 0 ? '' : '\n'}    store,`;
        }
    });

    // main.js
    let mainJs =
        `import Vue from 'vue'
${nodeModules}

import App from './App.vue'
${urls}

import IvueMaterial from 'ivue-material'
import 'ivue-material/dist/styles/ivue.css'

${configs}
Vue.use(IvueMaterial)

Vue.config.productionTip = false

new Vue({
${names}
    render: h => h(App),
}).$mount('#app')
`;

    mainJs = etplCompile.compile(mainJs)();

    // 重新写入文件
    fs.writeFileSync(path.resolve(`${storeDir}/src`, 'main.js'), mainJs);
}
