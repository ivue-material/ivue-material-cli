'use strict';

// init 安装脚手架命令
const init = require('./action');
// 提示文件
const locals = require('../../locals')();

module.exports = function (program) {

    // define lavas init command
    program
        .command('init')
        .description(locals.INIT_DESC)
        .option('-f, --force', locals.INIT_OPTION_FORCE)
        .action(options => init({
            force: options.force
        }));
};
