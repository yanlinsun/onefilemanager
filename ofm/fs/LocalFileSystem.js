'use strict';

const os = require('os');
const fs = require('fs');
const path = require('path');
const File = require('./File.js');
const shell = require('electron').shell;
const log = require('electron-log');

class LocalFileSystem {
    constructor() {
    }

    async getHomeDir() {
        return await this.getDir(os.homedir());
    }

    async getDir(fullpath) {
        log.debug("LFS.getDir enter: [" + fullpath + "]");
        let f = new File(fullpath, '.');
        await this.listDir(f);
        log.debug("LFS.getDir exit");
        return f;
    }

    async listDir(dir, bypassCache) {
        if (!dir instanceof File) {
            throw new Error("listDir require parameter type of File");
        }
        if (!dir.isDirectory) {
            throw new Error(dir.fullpath + " is not a directory");
        }
        let pfx = "LFS.listDir[" + dir.fullpath + "]: ";
        log.debug(pfx + "enter");
        if (!bypassCache && dir.children.length > 0) {
            log.debug(pfx + " exit (cache) ");
            return dir.children;
        }
        log.debug(pfx + " read from fs");
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
        log.debug(pfx + ": " + files.length);
        files = files.map(f => {
            let file = new File(dir.fullpath, f);
            file.parentFile = dir;
            return file.loadAttr();
        });
        files = await Promise.all(files);
        log.debug(pfx + " get file's attr " + files.length);
        let parentDir = path.resolve(dir.fullpath, '..');
        if (parentDir != dir.fullpath) {
            // not root folder
            let parentFile = new File(dir.fullpath, '..');
            //parentFile.view = dir.view;
            files = [parentFile, ...files];
        }
        dir.children = files;
        log.debug(pfx + " exit");
        return files;
    }

    async open(file) {
        if (file.isDirectory) {
            throw new Error(file.fullpath + " is not a file");
        }
        log.debug("LFS.open[" + file.fullpath + "]");
        shell.openItem(file.fullpath);
    }

    async move(srcFs, files, target) {
        if (!target instanceof File) {
            throw new Error("target must be a File, current: " + target);
        }
        if (srcFs instanceof LocalFileSystem) {
            return await this.localMove(files, target);
        }
    }

    async localMove(files, target) {
        log.debug("LFS.localMove: " + files.length + " files => [" + target.fullpath + "]");
        let promises = files.map(f => new Promise((resolve, reject) => {
            let dest = path.resolve(target.fullpath, f.fullname);
            console.log("LFS.localMove: [" + f.fullpath + "] => [" + dest + "]");
            fs.rename(f.fullpath, dest,
                (err) => { 
                    if (err) { 
                        reject(err);
                    } else {
                        resolve(f.fullname);
                    }
                });
        }));
        try {
            let result = Promise.all(promises);
            log.debug("LFS.localMove: exit");
            return result;
        } catch (err) {
            log.error(err);
        }
    }
}

module.exports = LocalFileSystem;
