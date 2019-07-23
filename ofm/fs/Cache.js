'use strict';

const File = require('./File.js');

const __cache = new Map();

function get(fullpath) {
        return __cache.get(fullpath);
}

function set(fullpath, file) {
    if (!(file instanceof File)) {
        throw new Error("File required for cache: " + file);
    }
    __cache.set(fullpath, file);
}

module.exports = { get, set };
