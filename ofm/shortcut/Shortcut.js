'use strict';

const FileShortcut = require('./FileShortcut.js');
const TabShortcut = require('./TabShortcut.js');
const NavShortcut = require('./NavShortcut.js');
const log = require('electron-log');

class Shortcut {
    constructor() {
        this.mapping = new Map();
        this.keys = new Array();
        document.addEventListener("keydown", e => this.handleDown(e));
        document.addEventListener("keyup", e => this.handleUp(e));
    }

    registerAll() {
        new FileShortcut(this.register);
        new TabShortcut(this.register);
        new NavShortcut(this.register);
    }

    register = (key, fn) => this.registerKey(key, fn);

    handleDown(e) {
        if (e.defaultPrevented) {
            return; 
        }
        if (this.keys.indexOf(e.key) == -1) {
            this.keys.push(e.key);
        }
        let key = this.keys.sort().join("+");
        if (this.mapping.has(key.toUpperCase())) {
            let fn = this.mapping.get(key.toUpperCase());
            log.debug("Shortcurt.handleDown: Key[" + key + "] => [" + (fn ? fn.name : "null") + "]");
            if (fn) {
                try {
                    fn();
                } catch (err) {
                    console.error(err);
                }
            }
            this.keys = [];
        }
        e.preventDefault();
    }

    handleUp(e) {
        let i = this.keys.indexOf(e.key);
        if (i !== -1) {
            this.keys = this.keys.splice(i, 1);
        }
    }

    registerKey(key, fn) {
        if (process.platform === 'darwin') {
            key = key.replace("ControlOrCommand", "Meta");
            key = key.replace("Command", "Meta");
        } else {
            key = key.replace("ControlOrCommand", "Control");
        }
        let a = key.split("+");
        key = a.sort().join("+");
        log.debug("Shortcurt.register: Key[" + key + "] => [" + (fn ? fn.name : "") + "]");
        this.mapping.set(key.toUpperCase(), fn);
    }

    static registerAll() {
        let sc = new Shortcut();
        sc.registerAll();
    }
}

module.exports = Shortcut;
