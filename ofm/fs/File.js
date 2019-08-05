'use strict';

const path = require('path');
const FileType = require('./FileType.js');

class File {
    constructor(fullpath, fs) {
        if (!fs) {
            throw new Error("FileSystem required to construct File object");
        }
        this.fullpath = fullpath;
        let file = path.parse(fullpath);
        this.fs = fs;
        this.name = file.name;
        this.fullname = file.base;
        this.ext = file.ext;
        if (this.ext.length > 0 && this.ext.charAt(0) === '.') {
            this.ext = this.ext.substring(1);
        }
        this._root = false;
        this.size = '-';
        this.date = '-';
        this._directory = false;
        this.isHidden = false;
        this.type = FileType.getFiletype(this.ext);
        this.children = null;
        this.accessible = true;
        this.cloudProvider = null;
        this.parentFile = null;
    }

    set isDirectory(flag) {
        this._directory = true;
        this.type = FileType.Directory;
        this.size = '-';
    }

    get isDirectory() {
        return this._directory;
    }
}

module.exports = File;
