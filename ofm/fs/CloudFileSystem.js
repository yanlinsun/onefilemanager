'use strict';

const FileSystem = require('./FileSystemEnum.js');
const OneFileSystem = require('./OneFileSystem.js');
const GoogleDrive = require('./cloud/GoogleDrive.js');
const File = require('./File.js');
const log = require('../trace/Log.js');

class CloudFileSystem extends OneFileSystem {
    constructor() {
        super(FileSystem.CloudFileSystem);
        this.providers = [];
        this.initProviders();
    }

    initProviders() {
        this.providers.push(new GoogleDrive('Default'));
    }

    async getParentFile(file) {
        if (file.parentFile) {
            return file.parentFile;
        }
        let parentFullpath = path.resolve(file.fullpath, '..');
        if (parentFullpath === file.fullpath) {
            // root folder
            
        } else {
            file.parentFile = await this.getFile(file.parentFullpath);
        }
        return file.parentFile;
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

    async _getFileAttr(file) {
        if (this.isRoot(file)) {
            file.isDirectory = true;
            return file;
        } else {
            throw new Error("Not implemented yet");
        }
    }

    isRoot(dir) {
        return dir.fullpath === '/';
    }

    async _getChildren(dir, bypassCache) {
        let files;
        if (this.isRoot(dir)) {
            files = [];
            for (let p of this.providers.values()) {
                files.push(p.rootDir());
            }
        } else {
            let provider = await this.getProvider(dir.cloudProvider);
            files = await provider.listDir(dir);
        }
        this.updateCache(files);
        return files;
    }

    async _getOpenPath(file) {
        throw new Error("Not implemented yet");
    }

    async _move(srcFs, files, target) {
        let provider = await this.getProvider();
        throw new Error("Not implemented yet");
    }

    async _copy(srcFs, files, target) {
        let provider = await this.getProvider();
        throw new Error("Not implemented yet");
    }

    async _moveToTrash(files) {
        throw new Error("Not implemented yet");
    }

    async _delete(files) {
        let provider = await this.getProvider();
        throw new Error("Not implemented yet");
    }

    async _createFilder(name, target) {
        throw new Error("Not implemented yet");
    }

    async _readFile(fullpath) {
        throw new Error("Not implemented yet");
    }

    async _writeFile(fullpath, content) {
        throw new Error("Not implemented yet");
    }
}

module.exports = CloudFileSystem;
