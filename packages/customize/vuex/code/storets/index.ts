import Vue from 'vue';
import Vuex, { Store } from 'vuex';

import appStore from './modules/app-store';

Vue.use(Vuex);

const store: Store<any> = new Vuex.Store({
    modules: {
        appStore
    }
});

export default store;
