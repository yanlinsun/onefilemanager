'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

const Types = {
    "sh": "Shell Script",
    "bat" : "Windows Batch File",
    "mp3" : "MP3 Audio File",
    "": "File"
}

class File {
    constructor(filepath, view) {
        this.path = filepath;
        this.name = path.basename(filepath);
        this.ext = path.extname(filepath);
        this.view = view;
        this.loadAttr();
    }

    loadAttr() {
        fs.stat(this.path, (err, stats) => {
            if (err) {
                console.error(err);
            } else {
                this.size = stats.size;
                this.date = new Date(stats.ctimeMs).toISOString();
                this.type = this.determineType(stats);
                this.view.showFile(this);
            }
        });
    }

    determineType(stats) {
        if (stats.isDirectory()) {
            return "Directory";
        }
        return Types[this.ext];
    }
}

module.exports = File;
