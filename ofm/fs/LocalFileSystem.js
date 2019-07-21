'use strict';

const os = require('os');
const fs = require('fs');
const path = require('path');
const File = require('./File.js');
const shell = require('electron').shell;

class LocalFileSystem {
    constructor() {
    }

    homeDir() {
        let dir = os.homedir();
        return new File(dir, '.');
    }

    async getDir(fullpath) {
        let f = new File(fullpath, '.');
        await this.listDir(f);
        return f;
    }

    async listDir(dir) {
        if (!dir instanceof File) {
            throw new Error("listDir require parameter type of File");
        }
        if (!dir.isDirectory) {
            throw new Error(dir.fullpath + " is not a directory");
        }
        if (dir.children.length > 0) {
            return dir.children;
        }
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
        files = files.map(f => {
            let file = new File(dir.fullpath, f);
            file.parentFile = dir;
            return file.loadAttr();
        });
        files = await Promise.all(files);
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
        console.log("open: " + file.fullpath);
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
        let promises = files.map(f => new Promise((resolve, reject) => {
            let dest = path.resolve(target.fullpath, f.fullname);
            console.log("move: " + f.fullpath + " to " + dest);
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
            return result;
        } catch (err) {
            console.error(err);
        }
    }
}

module.exports = LocalFileSystem;
