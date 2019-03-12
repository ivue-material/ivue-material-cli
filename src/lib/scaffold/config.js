/**
 * @file  scaffold 相关配置
 */
'use strict';
const path = require('path');

module.exports = {
    /**
     * 全局的配置文件地址
     *
     * @type {String}
     */
    GLOBAL_CONF_URL: {
        production: '../../../scaffold-config-dev.json',
        development: '../../../scaffold-config-dev.json'
    },

}
