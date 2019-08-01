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
        this._directory = false;
        this.isHidden = false;
        this.type = FileType.getFiletype(this.ext);
        this._children = [];
        this.accessible = true;
        this.cloudProvider = null;
        if (this.name == '..') {
            this._directory = true;
            this.type = FileType.ParentFolder;
        }
    }

    set isDirectory(flag) {
        this._directory = true;
        this.type = FileType.Directory;
        this.size = '-';
        let parentDir = path.resolve(this.fullpath, '..');
        if (parentDir != this.fullpath) {
            // not root folder
            this.parentFolder = new File(parentDir, '..');
            this.parentFolder.fs = this.fs;
            this.parentFolder.cloudProvider = this.cloudProvider;
        }
    }

    get isDirectory() {
        return this._directory;
    }

    set children(files) {
        if (this.isDirectory) {
            if (this.parentFolder) {
                this._children = [ this.parentFolder, ...files ];
            } else {
                this._children = files.slice();
            }
        }
    }

    get children() {
        return this._children;
    }
}

module.exports = File;
