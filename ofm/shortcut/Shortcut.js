'use strict';

const FileShortcut = require('./FileShortcut.js');
const TabShortcut = require('./TabShortcut.js');
const NavShortcut = require('./NavShortcut.js');
const QuickSearch = require('./QuickSearch.js');
const log = require('../trace/Log.js');
const mousetrap = require('mousetrap');

class Shortcut {
    constructor() {
        new FileShortcut((key, fn) => this.register(key, fn));
        new TabShortcut((key, fn) => this.register(key, fn));
        new NavShortcut((key, fn) => this.register(key, fn));
        new QuickSearch((key, fn) => this.register(key, fn));
        this.map = new Map();
    }

    register(key, fn) {
        let obj = this.map.get(key);
        if (obj) {
            if (obj instanceof Function) {
                let ary = [];
                ary.push(obj);
                ary.push(fn);
                this.map.set(key, ary);
                mousetrap.bind(key, (e, key) => this.multipleHandler(e, key, ary));
                return;
            } else if (obj instanceof Array) {
                obj.push(fn);
            } else {
                log.error("Logic error, unknown instnace");
            }
        } else {
            this.map.set(key, fn);
        }
        if (key instanceof Array) {
            let keys = key.map(k => Shortcut.translate(k));
            log.debug("Shortcurt.register: Key[%s] => [%s]", keys.join(), (fn ? fn.name : ""));
            mousetrap.bind(keys, fn);
        } else {
            log.debug("Shortcurt.register: Key[%s] => [%s]", key, (fn ? fn.name : ""));
            mousetrap.bind(Shortcut.translate(key), fn);
        }
    }

    multipleHandler(e, key, fnAry) {
        
    }

    static translate(k) {
        k = k.toLowerCase();
        let i = k.indexOf("commandor");
        if (i !== -1) {
            if (process.platform === "darwin") {
                let j = k.indexOf("+", i);
                k = k.substring(0, i + 7) + k.substring(j);
            } else {
                k = k.replace("commandor", "");
            }
        }
        return k.replace("control", "ctrl")
                .replace("delete", "del");
    }

    static registerAll() {
        new Shortcut();
    }
}

module.exports = Shortcut;
