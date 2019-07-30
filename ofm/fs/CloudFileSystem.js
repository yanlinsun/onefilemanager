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
                let c = await p.connection;
                if (c === -1) {
                    // not login or expired, try again
                    p.connection = p.connect();
                    c = await p.connection;
                    if (c === -1) {
                        let err = new Error("No connection to cloud provider");
                        err.code = 'ECLOUDNOCONN';
                        err.message = 'No connection to cloud provider';
                        throw err;
                    }
                }
                return p;
            }
        }
    }

    async download(file) {
        let provider = await this.getProvider();
        throw new Error("Not implemented yet");
    }

    async upload(file) {
        let provider = await this.getProvider();
        throw new Error("Not implemented yet");
    }

    async getHomeDir() {
        let file = new File("/", '.', true);
        return await this.getDir(file);
    }

    async getParentFile(file) {
        throw new Error("Not implemented yet");
    }

    async getFileAttr(file) {
        throw new Error("Not implemented yet");
    }

    async getFile(file, bypassCache) {
        let provider = await this.getProvider();
        let files = await provider.listDir(file.fullpath);
        file.children = files;
        return file;
    }

    async listDir(directory, bypassCache) {
        let provider = await this.getProvider();
        throw new Error("Not implemented yet");
    }

    async open(file) {
        throw new Error("Not implemented yet");
    }

    async move(srcFs, files, target) {
        let provider = await this.getProvider();
        throw new Error("Not implemented yet");
    }

    async copy(srcFs, files, target) {
        let provider = await this.getProvider();
        throw new Error("Not implemented yet");
    }

    async moveToTrash(files) {
        throw new Error("Not implemented yet");
    }

    async delete(files, permanent) {
        let provider = await this.getProvider();
        throw new Error("Not implemented yet");
    }

    async createFilder(name, target) {
        throw new Error("Not implemented yet");
    }

    async readFile(fullpath) {
        throw new Error("Not implemented yet");
    }

    async writeFile(name, target, content) {
        let fullpath = path.resolve(target.fullpath, name);
        return await this.writeFile(fullpath, content);
    }

    async writeFile(fullpath, content) {
        throw new Error("Not implemented yet");
    }
}

module.exports = CloudFileSystem;
