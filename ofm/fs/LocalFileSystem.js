'use strict';

const fs = require('fs');

class LocalFileSystem {
    constructor() {
    }

    async listDir(path) {
        let p = new Promise((resolve, reject) => {
            fs.readdir(path, { withFileTypes: false }, (err, files) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(files);
                }

            });
        });
        return await p;
    }
}

module.exports = LocalFileSystem;
