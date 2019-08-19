/** 更改状态  同步操作 **/
import * as types from './mutation-types';
import { RootStateTypes } from './types'
import { MutationTree } from 'vuex';

const mutations: MutationTree<RootStateTypes> = {
    /**
     * 标题
     * @type {String}
     */
    [types.TITLE](state: RootStateTypes, title: string) {
        state.title = title;
    }
}

export default mutations;
