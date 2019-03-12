const dns = require('dns');

/**
 * 检测当前网络环境
 *
 * @return {Boolean} 是否联网
 */
exports.isNetworkConnect = function () {
    return new Promise((reslove) => {
        dns.lookup('baidu.com', (err) => reslove(!(err && err.code === 'ENOTFOUND')));
    });
}
