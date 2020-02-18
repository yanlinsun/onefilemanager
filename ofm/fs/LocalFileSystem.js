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
const OneFileSystem = require('./OneFileSystem.js');
const log = require('../trace/Log.js');

class LocalFileSystem extends OneFileSystem {
    constructor() {
        super(FileSystem.LocalFileSystem);
    }

    async getRoot() {
        let root = path.parse(process.cwd()).root;
        return await this.getFile(root);
    }

    async _getFileAttr(file) {
        let p = new Promise((resolve, reject) => {
            hidefile.isHidden(file.fullpath, (err, flag) => {
                file.isHidden = flag;
                fs.stat(file.fullpath, (err, stats) => {
                    if (err) {
                        file.accessible = false;
                        log.error("File [%s] not accessible: %s", file.fullpath, err.message);
                        resolve(file);
                    } else {
                        file.size = stats.size;
                        file.date = new Date(stats.ctimeMs);
                        if (stats.isDirectory()) {
                            file.isDirectory = true;
                            file.type = FileType.Directory;
                        }
                        resolve(file);
                    }
                });
            });
        });
        return await p;
    }

    async _getChildren(dir, bypassCache) {
        log.debug("lfs list [%s] from fs", dir.fullpath);
        let loading = new Promise((resolve, reject) => {
            fs.readdir(dir.fullpath, { withFileTypes: false }, (err, files) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(files);
                }

            });
        });
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
        return files;
    }

    async _getOpenPath(file) {
        return file.fullpath;
    }

    async _move(srcFs, files, target) {
        if (srcFs instanceof LocalFileSystem) {
            return await this._localMove(files, target);
        }
    }

    async _localMove(files, target) {
        let promises = files.map(f => new Promise((resolve, reject) => {
            let dest = path.resolve(target.fullpath, f.fullname);
            fs.rename(f.fullpath, dest,
                (err) => { 
                    if (err) { 
                        reject(err);
                    } else {
                        resolve(f.fullname);
                    }
                });
        }));
        let result = Promise.all(promises);
        return result;
    }

    async _copy(srcFs, files, target) {
        let promises = files.map(f => new Promise((resolve, reject) => {
            let dest = path.resolve(target.fullpath, f.fullname);
            fs.copyFile(f.fullpath, dest,
                (err) => { 
                    if (err) { 
                        reject(err);
                    } else {
                        resolve(f.fullname);
                    }
                });
        }));
        let result = Promise.all(promises);
        return result;
    }

    async _moveToTrash(files) {
        return files.map(f => shell.moveItemToTrash(f.fullpath));
    }

    async _delete(files) {
        let promises = files.map(f => new Promise((resolve, reject) => {
            if (f.isDirectory) {
                fs.rmdir(f.fullpath, (err) => { 
                    if (err) { 
                        reject(err);
                    } else {
                        resolve(f.fullname);
                    }
                });
            } else {
                fs.unlink(f.fullpath, (err) => { 
                    if (err) { 
                        reject(err);
                    } else {
                        resolve(f.fullname);
                    }
                });
            }
        }));
        let result = Promise.all(promises);
        return result;
    }

    async _createFolder(name, target) {
        let fullpath = path.resolve(target.fullpath, name);
        let p = new Promise((resolve, reject) => {
            fs.mkdir(fullpath, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(fullpath);
                }
            });
        });
        let result = await p;
        return result;
    }

    async _readFile(fullpath) {
        let p = new Promise((resolve, reject) => {
            fs.readFile(fullpath, (err, content) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(content);
                }
            });
        });
        let content = await p;
        return content;
    }

    async _writeFile(fullpath, content) {
        let p = new Promise((resolve, reject) => {
                fs.writeFile(fullpath, content ? content : "", (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(fullpath);
                    }
                });
            });
        let result = await p;
        return result;
    }
}

module.exports = LocalFileSystem;
