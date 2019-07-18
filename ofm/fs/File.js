'use strict';

const fs = require('fs');
const path = require('path');

const Types = {
    "sh": "Shell Script",
    "bat" : "Windows Batch File",
    "mp3" : "MP3 Audio File",
    "" : "File"
}

class File {
    constructor(dir, file) {
        this.fullpath = path.resolve(dir, file);
        this.name = path.basename(file);
        this.ext = path.extname(file);
        if (this.name == '..' || this.name == '.') {
            this.size = '-';
            this.date = '-';
            this.type = '-';
            this.isDirectory = true;
        }
        this.children = [];
    }

    async loadAttr() {
        return new Promise((resolve, reject) => {
            fs.stat(this.fullpath, (err, stats) => {
                if (err) {
                    reject(err);
                } else {
                    this.size = stats.size;
                    this.date = new Date(stats.ctimeMs).toLocaleString();
                    this.type = this.determineType(stats);
                    this.isDirectory = stats.isDirectory();
                    resolve(this);
                }
            });
        });
    }

    determineType(stats) {
        if (stats.isDirectory()) {
            return "Directory";
        }
        return Types[this.ext] || Types[""];
    }

    add(f) {
        this.children.add(f);
    }
}

module.exports = File;
