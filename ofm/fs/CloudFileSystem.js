'use strict';

const FileSystem = require('./FileSystemEnum.js');
const OneFileSystem = require('./OneFileSystem.js');
const GoogleDrive = require('./cloud/GoogleDrive.js');
const File = require('./File.js');

class CloudFileSystem extends OneFileSystem {
    constructor() {
        super(FileSystem.CloudFileSystem);
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
        throw log.notimpl;
    }

    async upload(file) {
        let provider = await this.getProvider();
        throw log.notimpl;
    }

    async _getFileAttr(file) {
        throw log.notimpl;
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
        directory.children = files;
        return directory.children;
    }

    async _getOpenPath(file) {
        throw log.notimpl;
    }

    async _move(srcFs, files, target) {
        let provider = await this.getProvider();
        throw log.notimpl;
    }

    async _copy(srcFs, files, target) {
        let provider = await this.getProvider();
        throw log.notimpl;
    }

    async _moveToTrash(files) {
        throw log.notimpl;
    }

    async _delete(files) {
        let provider = await this.getProvider();
        throw log.notimpl;
    }

    async _createFilder(name, target) {
        throw log.notimpl;
    }

    async _readFile(fullpath) {
        throw log.notimpl;
    }

    async _writeFile(fullpath, content) {
        throw log.notimpl;
    }
}

module.exports = CloudFileSystem;
