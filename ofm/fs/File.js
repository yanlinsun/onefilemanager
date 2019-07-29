'use strict';

const path = require('path');
const DefaultFileSystem = require('./FileSystemEnum.js').LocalFileSystem;
const FileType = require('./FileType.js');

class File {
    constructor(fullpath, name) {
        this.fullpath = fullpath;
        let file = path.parse(fullpath);
        this.fs = DefaultFileSystem;
        this.name = file.name;
        this.fullname = file.base;
        this.ext = file.ext;
        if (name) {
            this.fullname = name;
            this.name = name;
        }
        if (this.ext.length > 0 && this.ext.charAt(0) === '.') {
            this.ext = this.ext.substring(1);
        }
        this.root = file.root;
        this.size = '-';
        this.date = '-';
        this.isDirectory = false;
        this.isHidden = false;
        if (this.name == '..' || this.name == '.') {
            this.isDirectory = true;
            this.type = FileType.Directory;
        } else {
            this.type = FileType.getFiletype(this.ext);
        }
        this.children = [];
    }
}

module.exports = File;
