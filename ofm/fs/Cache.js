'use strict';

const File = require('./File.js');

const __cache = new Map();

function get(fullpath) {
        return __cache.get(fullpath);
}

function set(fullpath, file) {
    if (!(file instanceof File || file instanceof Promise)) {
        throw new Error("Parameter need to be a File or Promise, found: " + file);
    }
    __cache.set(fullpath, file);
}

module.exports = { get, set };
