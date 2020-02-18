'use strict';

const path = require('path');
const File = require('../File.js');

class Cloud extends File {
    constructor() {
        super(path.sep + path.sep + "Cloud", window.cloudfs);
        this.isDirectory = true;
    }
}

module.exports = Cloud;
