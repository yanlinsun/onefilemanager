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
    async getProvider(providerId, excludeList) {
        let ex = excludeList ? Array.from(excludeList) : null;
        for (let p of this.providers.values()) {
            if (!ex || ex.indexOf(p.name) === -1) {
                if (!providerId || p.providerId === providerId) {
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
        return null;
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
        let provider = await this.getProvider();
        let file = provider.rootDir();
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
        f.fs = this;
        if (this.isRoot(fullpath)) {
            f.isDirectory = true;
        } else {
            let i = fullpath.indexOf('/');
            if (i !== -1) {
                f.cloudProvider = fullpath.substring(0, i);
            } else {
                throw new Error("Malfomed cloud file path");
            }
        }
        f.fs = this.name;
        return f;
    }

    isRoot(fullpath) {
        return fullpath === '/';
    }

    async listDir(directory, bypassCache) {
        let files;
        if (this.isRoot(directory.fullpath)) {
            files = [];
            for (let p of this.providers.values()) {
                files.push(p.rootDir());
            }
        } else {
            let provider = await this.getProvider(directory.cloudProvider);
            files = await provider.listDir(directory);
        }
        directory.children = files;
        return directory.children;
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
