'use strict';

const FileSystem = require('./FileSystemEnum.js');
const GoogleDrive = require('./cloud/GoogleDrive.js');
const File = require('./File.js');

class CloudFileSystem {
    constructor() {
        this.name = FileSystem.CloudFileSystem;
        this.providers = [];
        this.initProviders();
    }

    initProviders() {
        this.providers.push(new GoogleDrive('Default'));
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
                }
                return p;
            }
        }
    }

    async isAllConnected() {
        for (let p of this.providers.values()) {
            let c = await p.connection;
            if (!c) {
                return false;
            }
        }
        return true;
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
        let file = await this.getFile("/");
        return await this.listDir(file);
    }

    async getParentFile(file) {
        throw new Error("Not implemented yet");
    }

    async getFileAttr(file) {
        throw new Error("Not implemented yet");
    }

    async getFile(fullpath, bypassCache) {
        let f = new File(fullpath);
        f.fs = this.name;
        return f;
    }

    async listDir(directory, bypassCache) {
        let provider = await this.getProvider();
        let files = await provider.listDir(directory.fullpath);
        directory.children = files;
        return files;
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
