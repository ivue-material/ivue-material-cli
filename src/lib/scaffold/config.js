/**
 * @file  scaffold 相关配置
 */
'use strict';
const path = require('path');
const utils = require('../utils');
const jsonP = require('../../../scaffold-config-dev.json');

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
    TAR_GZ_ENDPOINT: 'https://bos.nj.bpc.baidu.com/v1/assets/lavas/',
}
