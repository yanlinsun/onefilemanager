'use strict';

const FileShortcut = require('./FileShortcut.js');
const TabShortcut = require('./TabShortcut.js');
const NavShortcut = require('./NavShortcut.js');
const log = require('electron-log');
const mousetrap = require('mousetrap');

class Shortcut {
    constructor() {
        new FileShortcut(this.register);
        new TabShortcut(this.register);
        new NavShortcut(this.register);
    }

    register(key, fn) {
        if (key instanceof Array) {
            key.forEach(k => {
                log.debug("Shortcurt.register: Key[" + k + "] => [" + (fn ? fn.name : "") + "]");
                mousetrap.bind(k.toLowerCase(), fn);
            });
        } else {
            log.debug("Shortcurt.register: Key[" + key + "] => [" + (fn ? fn.name : "") + "]");
            mousetrap.bind(key.toLowerCase(), fn);
        }
    }

    static registerAll() {
        new Shortcut();
    }
}

module.exports = Shortcut;
