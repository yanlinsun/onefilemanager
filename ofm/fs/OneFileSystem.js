'use strict';

const os = require('os');
const fs = require('fs');
const path = require('path');
const shell = require('electron').shell;
const hidefile = require('hidefile');
const File = require('./File.js');
const FileType = require('./FileType.js');
const FSCache = require('./Cache.js');
const FileSystem = require('./FileSystemEnum.js');
const Root = require('./Root.js');
const log = require('../trace/Log.js');

class OneFileSystem {
    constructor(name) {
        this.name = name;
        this.cache = new FSCache();
    }

    updateCache(files, overwrite) {
        files.forEach(f => {
            if (overwrite || !this.cache.has(f.fullpath)) {
                this.cache.set(f.fullpath, f);
            }
        });
    }

    homeDir() {
        return os.homedir();
    }

    async getHomeDir() {
        return await this.getFile(os.homedir());
    }

    async getParentFile(file) {
        if (file.parentFile) {
            return file.parentFile;
        }
        let parentFullpath = path.resolve(file.fullpath, '..');
        if (parentFullpath === file.fullpath) {
            // root folder
            let root = Root.getRoot(); // file.parentFile = root is done in root constructor           
            await root.buildChildren();
            if (file.parentFile !== root) {
                throw new Error("Logic error! Root not same");
            }
        } else {
            file.parentFile = await this.getFile(parentFullpath);
        }
        return file.parentFile;
    }

    async _getFileAttr(file) {
        throw new Error("Method should be implemented by subclass");
    }

    async getFile(fullpath, bypassCache) {
        log.debug("lfs get [%s]", fullpath);
        let f = this.cache.get(fullpath);
        if (!f || bypassCache) {
            log.debug("lfs [%s] not in cache, read from fs", fullpath);
            f = new File(fullpath, this);
            let p = this._getFileAttr(f);
            this.cache.set(fullpath, p);
            await p;
            log.debug("lfs [%s] read from fs finished", fullpath);
            this.cache.set(fullpath, f);
        } else if (f instanceof Promise) {
            log.debug("lfs [%s] awaitable in cache, wait", fullpath);
            f = await f;
            log.debug("lfs [%s] awaitable finished", fullpath);
        } else if (f instanceof File) {
            log.debug("lfs read [%s] from cache", fullpath);
        }
        return f;
    }

    async _getChildren(dir, bypassCache) {
        throw new Error("Method should be implemented by subclass");
    }

    async listDir(dir, bypassCache) {
        if (!dir.isDirectory) {
            throw new Error(log.printf("%s is not a directory", dir.fullpath));
        }
        if (!bypassCache && dir.children) {
            return dir.children;
        }
        let files = await this._getChildren(dir); 
        dir.children = files;
        return dir.children;
    }

    async open(file) {
        if (file.isDirectory) {
            throw new Error(log.printf("%s is not a file", file.fullpath));
        }
        log.debug("lfs open [%s]", file.fullpath);
        let fullpath = await file.fs._getOpenPath(file);
        shell.openItem(file.fullpath);
    }

    async _getOpenPath(file) {
        throw new Error("Method should be implemented by subclass");
    }

    async move(srcFs, files, target) {
        if (!(target instanceof File) || !target.isDirectory) {
            throw new Error(log.printf("%s must be a directory", target));
        }
        return await this._move(srcFs, files, target);
    }

    async _move(srcFs, files, target) {
        throw new Error("Method should be implemented by subclass");
    }

    async copy(srcFs, files, target) {
        if (!(target instanceof File) || !target.isDirectory) {
            throw new Error(log.printf("%s must be a directory", target));
        }
        return await this._copy(srcFs, files, target);
    }

    async _copy(srcFs, files, target) {
        throw new Error("Method should be implemented by subclass");
    }

    _moveToTrash(files) {
        throw new Error("Method should be implemented by subclass");
    }

    async delete(files, permanently) {
        if (!permanently) {
            return this.moveToTrash(files);
        }
        return this._delete(files);
    }

    async _delete(files) {
        throw new Error("Method should be implemented by subclass");
    }

    async createFolder(name, target) {
        return await this._createFolder(name, target);
    }

    async _createFolder(name, target) {
        throw new Error("Method should be implemented by subclass");
    }

    async readFile(fullpath) {
        return await this._readFile(fullpath);
    }

    async _readFile(fullpath) {
        throw new Error("Method should be implemented by subclass");
    }

    async writeFile(name, target, content) {
        let fullpath = path.resolve(target.fullpath, name);
        return await this.writeFile(fullpath, content);
    }

    async writeFile(fullpath, content) {
        return await this._writeFile(fullpath, content);
    }

    async _writeFile(fullpath, content) {
        throw new Error("Method should be implemented by subclass");
    }
}

module.exports = OneFileSystem;
