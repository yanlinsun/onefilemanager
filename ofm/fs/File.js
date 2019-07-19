'use strict';

const fs = require('fs');
const path = require('path');
const hidefile = require('hidefile');

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
        this.size = '-';
        this.date = '-';
        this.type = '-';
        this.isDirectory = false;
        this.isHidden = false;
        if (this.name == '..' || this.name == '.') {
            this.isDirectory = true;
        }
        this.children = [];
    }

    async loadAttr() {
        return new Promise((resolve, reject) => {
            hidefile.isHidden(this.fullpath, (err, flag) => {
                this.isHidden = flag;
                fs.stat(this.fullpath, (err, stats) => {
                    if (err) {
                        resolve(this);
                    } else {
                        this.size = stats.size;
                        this.date = new Date(stats.ctimeMs);
                        this.type = this.determineType(stats);
                        this.isDirectory = stats.isDirectory();
                        resolve(this);
                    }
                });
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
