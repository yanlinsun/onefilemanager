'use strict';

//import { enumerateValues, HKEY, RegistryValueType } from 'registry-js';
const { enumerateValues, HKEY, RegistryValueType } = require('registry-js');
const File = require('../File.js');

class WindowsRoot extends File {
    constructor() {
        super("This PC", window.lfs);
        this._root = true;
        this._directory = true;
        this.children = buildChildren();
    }

    buildChildren() {
        const values = enumerateValues(
            HKEY.HKEY_LOCAL_MACHINE,
            'SOFTWARE\\Microsoft\\Windows\\CurrentVersion'
        );
        for (const value of values) {
            if (value.type === RegistryValueType.REG_SZ) {
                const stringData = value.data
                console.log(`Found: ${value.name} is ${stringData}`)
            } else if (value.type === RegistryValueType.REG_DWORD) {
                // 32-bit number is converted into a JS number
                const numberData = value.data
                console.log(`Found: ${value.name} is ${numberData}`)
            }
            // TODO: support other formats
        }
        return [];
    }
}

module.exports = WindowsRoot;
