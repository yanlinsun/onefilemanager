'use strict';

const os = require('os');
const fs = require('fs');
const path = require('path');
const File = require('./File.js');
const shell = require('electron').shell;
const cache = require('./Cache.js');
const log = require('../trace/Log.js');

class LocalFileSystem {
    constructor() {
    }

    async getHomeDir() {
        return await this.getDir(os.homedir());
    }

    async getDir(fullpath) {
        let f = cache.get(fullpath);
        if (!f) {
            log.debug("[%s] not in cache, read from fs", fullpath);
            let f = new File(fullpath, '.');
            let p = new Promise(async (resolve, reject) => {
                await this.listDir(f);
                resolve(f);
            });
            log.debug("set awaitable promise for [%s]", fullpath);
            cache.set(fullpath, p);
            f = await p;
            log.debug("main reading process finished");
        } else if (f instanceof Promise) {
            log.debug("read awaitable for [%s] from cache");
            f = await p;
            log.debug("awaitable reading process finished");
        } else if (f instanceof File) {
            log.debug("read [%s] from cache", fullpath);
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
        log.debug("list [%s]", dir.fullpath);
        let p = new Promise((resolve, reject) => {
            fs.readdir(dir.fullpath, { withFileTypes: false }, (err, files) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(files);
                }

            });
        });
        let files = await p;
        log.debug("load %i files", files.length);
        files = files.map(f => {
            let file = new File(dir.fullpath, f);
            log.debug("read [%s]", f);
            file.parentFile = dir;
            return file.loadAttr();
        });
        log.debug("file attributes load waiting");
        files = await Promise.all(files);
        log.debug("file attributes load finished");
        let parentDir = path.resolve(dir.fullpath, '..');
        if (parentDir != dir.fullpath) {
            // not root folder
            let parentFile = new File(dir.fullpath, '..');
            //parentFile.view = dir.view;
            files = [parentFile, ...files];
        }
        dir.children = files;
        return files;
    }

    async open(file) {
        if (file.isDirectory) {
            throw new Error(file.fullpath + " is not a file");
        }
        log.debug("open [%s]", file.fullpath);
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
}

module.exports = LocalFileSystem;
