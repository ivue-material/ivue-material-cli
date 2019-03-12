/**
 * @file 简单的 store
 */

'use strict';

const store = {};

module.exports = {
    /**
     * setter
     *
     * @param {String} name store key
     * @param {Any} value store value
     */
    set (name, value) {
        store[name] = value;
    },

    /**
     * getter
     *
     * @param {String} name store key
     * @return {[type]} store value
     */
    get (name) {
        return store[name];
    }
}
