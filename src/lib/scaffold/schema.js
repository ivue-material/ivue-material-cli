
const getMeta = require('./getMeta');
const store = require('./store');

/**
 * 把约定的 JSON CONF 内容解析成可自动化处理的 schema
 *
 * @param {Object}  conf 按照约定格式的配置 json 文件
 * @return {Object} schema
 */
function parseConfToSchema (conf = {}) {
    
}

/**
 * 获取元 Schema, 即模板选择的 Schema
 *
 * @return {Object} 元 Schema
 */
exports.getMetaSchema = async function () {
    let meta = await getMeta();
    let metaSchema = parseConfToSchema(meta);

    store.set('metaSchema', metaSchema);

    return metaSchema;
}
