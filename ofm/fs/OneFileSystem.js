'use strict';

const os = require('os');
const fs = require('fs');
const path = require('path');
const shell = require('electron').shell;
const hidefile = require('hidefile');
const File = require('./File.js');
const FileType = require('./FileType.js');
const cache = require('./Cache.js');
const FileSystem = require('./FileSystemEnum.js');
const log = require('../trace/Log.js');

class OneFileSystem {
    constructor(name) {
        this.name = name;
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
        if (!file.parentFullpath) {
            file.parentFullpath = path.resolve(file.fullpath, '..');
        }
        file.parentFile = await this.getFile(file.parentFullpath);
        return file.parentFile;
    }

    async _getFileAttr(file) {
        throw log.subimpl;
    }

    async getFile(fullpath, bypassCache) {
        log.debug("lfs get [%s]", fullpath);
        let f = cache.get(fullpath);
        if (!f || bypassCache) {
            log.debug("lfs [%s] not in cache, read from fs", fullpath);
            f = new File(fullpath, this);
            let p = this._getFileAttr(f);
            cache.set(fullpath, p);
            await p;
            log.debug("lfs [%s] read from fs finished", fullpath);
            cache.set(fullpath, f);
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
        throw log.subimpl("_getChildren");
    }

    async listDir(dir, bypassCache) {
        if (!dir.isDirectory) {
            throw new Error(log.printf("%s is not a directory", dir.fullpath));
        }
        if (!bypassCache && dir.children !== null) {
            return dir.children;
        }
        log.debug("lfs list [%s] from fs", dir.fullpath);
        let loading = await this._getChildren(dir); 
        let files = await loading;
        log.debug("lfs list [%s] loaded [%i] files", dir.fullpath, files.length);
        files = files.map(f => {
            let file = this.getFile(path.resolve(dir.fullpath, f), bypassCache);
            file.parentFile = dir;
            return file;
        });
        log.debug("lfs list [%s] waiting for all files' attributes to be loaded", dir.fullpath);
        files = await Promise.all(files);
        log.debug("lfs list [%s] all files attributes are loaded", dir.fullpath);
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
        throw log.subimpl("getOpenPath");
    }

    async move(srcFs, files, target) {
        if (!(target instanceof File) || !target.isDirectory) {
            throw new Error(log.printf("%s must be a directory", target));
        }
        return await this._move(srcFs, files, target);
    }

    async _move(srcFs, files, target) {
        throw log.subimpl("_move");
    }

    async copy(srcFs, files, target) {
        if (!(target instanceof File) || !target.isDirectory) {
            throw new Error(log.printf("%s must be a directory", target));
        }
        return await this._copy(srcFs, files, target);
    }

    async _copy(srcFs, files, target) {
        throw log.subimpl("_copy");
    }

    _moveToTrash(files) {
        throw log.subimpl("_moveToTrash");
    }

    async delete(files, permanently) {
        if (!permanently) {
            return this.moveToTrash(files);
        }
        return this._delete(files);
    }

    async _delete(files) {
        throw log.subimpl("_delete");
    }

    async createFolder(name, target) {
        return await this._createFolder(name, target);
    }

    async _createFolder(name, target) {
        throw log.subimpl("_createFolder");
    }

    async readFile(fullpath) {
        return await this._readFile(fullpath);
    }

    async _readFile(fullpath) {
        throw log.subimpl("_readFile");
    }

    async writeFile(name, target, content) {
        let fullpath = path.resolve(target.fullpath, name);
        return await this.writeFile(fullpath, content);
    }

    async writeFile(fullpath, content) {
        return await this._writeFile(fullpath, content);
    }

    async _writeFile(fullpath, content) {
        throw log.subimpl("writeFile");
    }
}

module.exports = OneFileSystem;
