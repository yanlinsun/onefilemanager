'use strict';

const os = require('os');
const fs = require('fs');
const path = require('path');
const shell = require('electron').shell;
const hidefile = require('hidefile');
const File = require('./File.js');
const FileType = require('./FileType.js');
const cache = require('./Cache.js');
const log = require('../trace/Log.js');

class LocalFileSystem {
    constructor() {
    }

    async getHomeDir() {
        return await this.getFile(os.homedir());
    }

    async getParentFile(file) {
        let dir = path.resolve(file.fullpath, '..');
        if (dir != file.fullpath) {
            return new File(dir);
        } 
        return null;
    }

    async getFileAttr(file) {
        let p = new Promise((resolve, reject) => {
            hidefile.isHidden(file.fullpath, (err, flag) => {
                file.isHidden = flag;
                fs.stat(file.fullpath, (err, stats) => {
                    if (err) {
                        if (err.code === 'EPERM' ||
                            err.code === 'EACCES') {
                            file.accessible = false;
                            log.error("File [%s] not accessible: %s", file.fullpath, err.message);
                            resolve(file);
                        } else {
                            reject(err);
                        }
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

    async getFile(fullpath, bypassCache) {
        log.debug("lfs get [%s]", fullpath);
        let f = cache.get(fullpath);
        if (!f || bypassCache) {
            log.debug("lfs [%s] not in cache, read from fs", fullpath);
            f = new File(fullpath);
            let p = this.getFileAttr(f);
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

    async listDir(dir, bypassCache) {
        if (!(dir instanceof File)) {
            throw new Error("listDir require parameter type of File");
        }
        if (!dir.isDirectory) {
            throw new Error(dir.fullpath + " is not a directory");
        }
        if (!bypassCache && dir.children.length > 0) {
            return dir.children;
        }
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
        files = files.map(f => this.getFile(path.resolve(dir.fullpath, f)));
        log.debug("lfs list [%s] waiting for all files' attributes to be loaded", dir.fullpath);
        files = await Promise.all(files);
        log.debug("lfs list [%s] all files attributes are loaded", dir.fullpath);
        let parentDir = path.resolve(dir.fullpath, '..');
        if (parentDir != dir.fullpath) {
            // not root folder
            let parentFile = new File(parentDir, '..');
            files = [parentFile, ...files];
        }
        dir.children = files;
        return files;
    }

    async open(file) {
        if (file.isDirectory) {
            throw new Error(file.fullpath + " is not a file");
        }
        log.debug("lfs open [%s]", file.fullpath);
        shell.openItem(file.fullpath);
    }

    async move(srcFs, files, target) {
        if (!(target instanceof File)) {
            throw new Error("target must be a File, current: " + target);
        }
        if (srcFs instanceof LocalFileSystem) {
            return await this.localMove(files, target);
        }
    }

    async localMove(files, target) {
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

    async copy(srcFs, files, target) {
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

    moveToTrash(files) {
        return files.map(f => shell.moveItemToTrash(f.fullpath));
    }

    async delete(files, permanently) {
        if (!permanently) {
            return this.moveToTrash(files);
        }
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

    async createFolder(name, target) {
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

    async readFile(fullpath) {
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

    async writeFile(name, target, content) {
        let fullpath = path.resolve(target.fullpath, name);
        return await this.writeFile(fullpath, content);
    }

    async writeFile(fullpath, content) {
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
