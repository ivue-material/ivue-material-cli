/** 更改状态  同步操作 **/

import * as types from './mutation-types';

const mutations = {
    /**
     * 标题
     * @type {String}
     */
    [types.TITLE] (state, title) {
        state.title = title;
    }
}

export default mutations;
