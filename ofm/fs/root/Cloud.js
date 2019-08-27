'use strict';

class Cloud extends File {
    constructor() {
        super("//Cloud", window.cloudfs);
        this.isDirectory = true;
    }
}

module.exports = Cloud;
