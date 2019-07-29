'use strict';

const GoogleDrive = require('./cloud/GoogleDrive.js');
const File = require('./File.js');

class CloudFileSystem {
    constructor() {
        this.providers = [];
        this.initProviders();
    }

    initProviders() {
        this.providers.push(new GoogleDrive());
    }

    /** 
     * get next available provider which not in the exclude list.
     * excludeList - string array Provider names
     */
    async getProvider(excludeList) {
        let ex = excludeList ? Array.from(excludeList) : null;
        for (let p of this.providers.values()) {
            if (!ex || ex.indexOf(p.name) === -1) {
                if (!p.connected) {
                    await p.connection;
                }
                return p;
            }
        }
    }

    async getHomeDir() {
        let file = new File("/", '.', true);
        return await this.getDir(file);
    }

    async getDir(file) {
        let provider = await this.getProvider();
        let files = await provider.listDir(file.fullpath);
        file.children = files;
        return file;
    }

    async listFiles(directory, bypassCache) {
        let provider = await this.getProvider();
    }

    async download(file) {
        let provider = await this.getProvider();
    }

    async upload(file) {
        let provider = await this.getProvider();
    }

    async move(files, target) {
        let provider = await this.getProvider();
    }

    async copy(files, target) {
        let provider = await this.getProvider();
    }

    async delete(files, permanent) {
        let provider = await this.getProvider();
    }
}

module.exports = CloudFileSystem;
