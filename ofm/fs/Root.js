'use strict';

const WindowsRoot = require('./root/WindowsRoot.js');
const MacOSRoot = require('./root/MacOSRoot.js');
//const LinuxRoot = require('./root/linux.js');

class Root {
    constructor() {
    }

    static getRoot() {
        if (process.platform === 'win32') {
            return new WindowsRoot();
        } else if (process.platform === 'darwin') {
            return new MacOSRoot();
        } else if (process.platform === 'linux') {
 //           return new LinuxRoot();
        } else {
            throw new Error("Not supported");
        }
    }
}

module.exports = Root;
