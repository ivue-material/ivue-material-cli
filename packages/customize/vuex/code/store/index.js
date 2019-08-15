import Vue from 'vue';
import Vuex from 'vuex';
import appStore from './modules/app-store.js';

Vue.use(Vuex);

export default new Vuex.Store({
    modules: {
        appStore
    }
});
