/**
 * @file  scaffold 相关配置
 */
'use strict';
const path = require('path');
const utils = require('../utils');
const jsonP = require('./templates/scaffold-config-dev.json');

module.exports = {

    /**
     * 本地模版存放路径
     *
     * @type {String}
     */
    LOCAL_TEMPLATES_DIR: path.resolve(utils.getHome(), 'tmp'),

    /**
     * 全局的配置文件地址
     *
     * @type {String}
     */
    GLOBAL_CONF_URL: {
        production: jsonP,
        development: jsonP
    },
    // TAR_GZ_ENDPOINT: 'https://bos.nj.bpc.baidu.com/v1/assets/lavas/',
    /**
     * 默认的 etpl 配置
     *
     * @type {Object}
     */
    ETPL: {
        commandOpen: '{%',
        commandClose: '%}',
        variableOpen: '*__',
        variableClose: '__*'
    },
    /**
     * 导出时默认忽略的文件或文件夹
     *
     * @type {Array<string>}
     */
    DEFAULT_EXPORTS_IGNORES: [
        '.git',
        'meta.js',
        'meta.json'
    ],
    /**
    * 渲染模版时默认忽略的文件或文件夹
    *
    * @type {Arrag<string>}
    */
    DEFAULT_RENDER_IGNORES: [
        'node_modules',
        '**/*.tmp', '**/*.log',
        '**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.bmp', '**/*.gif', '**/*.ico',
        '**/*.svg', '**/*.woff', '**/*.ttf', '**/*.woff2'
    ],
    /**
     * render common data
     *
     * @type {Object}
     */
    COMMON_DATA: {
        year: (new Date()).getFullYear(),
        time: Date.now()
    },
}
