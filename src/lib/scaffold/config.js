/**
 * @file  scaffold 相关配置
 */
'use strict';
const path = require('path');
const jsonP = require('../../../scaffold-config-dev.json');

module.exports = {
    /**
     * 全局的配置文件地址
     *
     * @type {String}
     */
    GLOBAL_CONF_URL: {
        production: jsonP,
        development: jsonP
    },

}
