'use strict';

const LocalFileSystem = require('./LocalFileSystem.js');
const log = require('../trace/Log.js');

class DelayLocalFileSystem extends LocalFileSystem {
    constructor() {
        super();
        this.delayValue = 2000;
    }

    async delay() {
        log.debug("Delay %i", this.delayValue);
        let p = new Promise((resolve, reject) => {
            setTimeout(() => resolve(), this.delayValue);
        });
        await p;
        log.debug("Delay finished", this.delayValue);
        return true;
    }

    async listDir(dir, bypassCache) {
        await this.delay();
        return await super.listDir(dir, bypassCache);
    }

    async open(file) {
        await this.delay();
        await super.open(file);
    }

    async localMove(files, target) {
        await this.delay();
        return await super.localMove(files, target);
    }

    async copy(srcFs, files, target) {
        await this.delay();
        return await super.copy(srcFs, files, target);
    }

    async delete(files, permanently) {
        await this.delay();
        return await super.delete(files, permanently);
    }

    async createFolder(name, target) {
        await this.delay();
        return await super.createFolder(name, target);
    }

    async readFile(fullpath) {
        await this.delay();
        return await super.readFile(fullpath);
    }

    async writeFile(fullpath, content) {
        await this.delay();
        return await super.writeFile(fullpath, content);
    }
}

module.exports = DelayLocalFileSystem;
