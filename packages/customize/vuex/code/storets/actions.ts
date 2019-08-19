/** 异步更改 **/
import * as types from './mutation-types';
import { Commit } from 'vuex';

export const setTitl: any = function (commit: Commit, title: string) {
    commit(types.TITLE, title);
};
