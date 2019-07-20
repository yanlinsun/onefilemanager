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
}

module.exports = LocalFileSystem;
