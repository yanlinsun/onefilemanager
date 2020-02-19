'use strict';

const File = require('./File.js');

class FSCache {

    constructor() {
        this.__cache = new Map();
    }

    get(fullpath) {
            return this.__cache.get(fullpath);
    }

    set(fullpath, file) {
        if (!(file instanceof File || file instanceof Promise)) {
            throw new Error("Parameter need to be a File or Promise, found: " + file);
        }
        this.__cache.set(fullpath, file);
    }

    clear() {
        this.__cache.clear();
    }

    has(fullpath) {
        return this.__cache.has(fullpath);
    }

}

module.exports = FSCache;
