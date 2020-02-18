'use strict';

const { enumerateValues, HKEY, RegistryValueType } = require('registry-js');
const File = require('../File.js');
const Cloud = require('./Cloud.js');

const LOC64Bit = 'SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Explorer\\MyComputer\\NameSpace';
const LOC32Bit = 'SOFTWARE\\Wow6432Node\\Microsoft\\Windows\\CurrentVersion\\Explorer\\MyComputer\\NameSpace';
const LOCFD = 'SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Explorer\\FolderDescriptions\\';

const Folders = [
     '{0DB7E03F-FC29-4DC6-9020-FF41B59E513A}', '3D Objects' ,
     '{754AC886-DF64-4CBA-86B5-F7FBF4FBCEF5}', 'Desktop' ,
     '{F42EE2D3-909F-4907-8871-4C22FC0BF756}', 'Documents' ,
     '{7D83EE9B-2244-4E70-B1F5-5393042AF1E4}', 'Downloads' ,
     '{A0C69A99-21C8-4671-8703-7934162FCF1D}', 'Music' ,
     '{0DDD015D-B06C-45D5-8C4C-F59713854639}', 'Pictures' ,
     '{35286A68-3C57-41A1-BBB1-0EAE73D76C95}', 'Videos'
];

class WindowsRoot extends File {
    constructor() {
        super("This PC", window.lfs);
        this._root = true;
        this.isDirectory = true;
        this.children = null;
    }

    async buildChildren() {
        let values = enumerateValues(HKEY.HKEY_LOCAL_MACHINE, LOC64Bit);
        let children = [];
        for (const value of values) {
            let policies = enumerateValues(HKEY.HKEY_LOCAL_MACHINE, 
                LOCFD + value.data + '\\PropertyBag');
            for (const p of policies) {
                if (value.name == 'ThisPCPolicy' && value.data == 'Show') {
                    let file = new File(f, window.lfs);
                    file.parentFile = this;
                    children.push(file);
                }
            }
        }
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

module.exports = WindowsRoot;
