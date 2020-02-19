'use strict';

const os = require('os');
const File = require('../File.js');
const Cloud = require('./Cloud.js');

class MacOSRoot extends File {
    constructor() {
        super("This Mac", window.lfs);
        this._root = true;
        this.isDirectory = true;
        this.children = null;
    }

    async buildChildren() {
        let children = [];
        let lfsRoot = await window.lfs.getRoot();
        lfsRoot.parentFile = this;
        children.push(lfsRoot);
        let cloud = new Cloud();
        cloud.parentFile = this;
        children.push(cloud);
        this.children = children;
        return children;
    }
}

module.exports = MacOSRoot;
