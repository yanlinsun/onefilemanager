'use strict';

const fs = require('fs');
const path = require('path');
const File = require('./File.js');

class LocalFileSystem {
    constructor() {
    }

    async listDir(dir) {
        let p = new Promise((resolve, reject) => {
            fs.readdir(dir, { withFileTypes: false }, (err, files) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(files);
                }

            });
        });
        let files = await p;
        files = files.map(f => new File(dir, f).loadAttr());
        files = await Promise.all(files);
        let parentDir = path.resolve(dir, '..');
        if (parentDir != dir) {
            let parentFile = new File(dir, '..');
            files = [parentFile, ...files];
        }
        return files;
    }
}

module.exports = LocalFileSystem;
