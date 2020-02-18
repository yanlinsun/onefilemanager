'use strict';

const FileShortcut = require('./FileShortcut.js');
const TabShortcut = require('./TabShortcut.js');
const NavShortcut = require('./NavShortcut.js');
const QuickSearch = require('./QuickSearch.js');
const log = require('../trace/Log.js');
const mousetrap = require('mousetrap');

class Shortcut {
    constructor() {
        this.map = new Map();
        // QuickSearch should be register before NavShortcut
        // as 'Backspace' key may register two times
        // QuickSearch should be executed first
        new QuickSearch((key, fn, flag) => this.register(key, fn, flag));
        new FileShortcut((key, fn, flag) => this.register(key, fn, flag));
        new TabShortcut((key, fn, flag) => this.register(key, fn, flag));
        new NavShortcut((key, fn, flag) => this.register(key, fn, flag));
    }

    register(key, fn, keepCase) {
        if (key instanceof Array) {
            let keys = key.map(k => Shortcut.translate(k, keepCase));
            log.debug("Shortcurt.register: Key[%s] => [%s]", keys.join(), (fn ? fn.name : ""));
            mousetrap.bind(keys, fn);
        } else {
            key = Shortcut.translate(key, keepCase);
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
            log.debug("Shortcurt.register: Key[%s] => [%s]", key, (fn ? fn.name : ""));
            mousetrap.bind(key, fn);
        }
    }

    multipleHandler(e, key, fnAry) {
        log.debug("Multiple Key Handler: %s", key);
        let ary = this.map.get(key);
        for (let i = 0; i < ary.length; i++) {
            let populate = ary[i](e, key);
            if (!populate) {
                break;
            }
        }
    }

    static translate(k, keepCase) {
        if (!keepCase) {
            k = k.toLowerCase();
        }
        if (process.platform === "darwin") {
            k = k.replace(/Command(Or)?(Control|Alt|Meta)/ig, "command");
        } else {
            k = k.replace(/CommandOr/ig, "");
        }
        return k.replace(/Control/ig, "ctrl")
                .replace(/Delete/ig, "del");
    }

    static registerAll() {
        new Shortcut();
    }
}

module.exports = Shortcut;
