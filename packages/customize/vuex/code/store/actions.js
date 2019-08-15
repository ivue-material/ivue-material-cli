/** 异步更改 **/

import * as types from './mutation-types';

export const setTitle = function ({ commit, state }, title) {
    commit(types.TITLE, title);
};
