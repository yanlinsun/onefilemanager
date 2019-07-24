'use strict';

const FileShortcut = require('./FileShortcut.js');
const TabShortcut = require('./TabShortcut.js');
const NavShortcut = require('./NavShortcut.js');
const QuickSearch = require('./QuickSearch.js');
const log = require('../trace/Log.js');
const mousetrap = require('mousetrap');

class Shortcut {
    constructor() {
        new FileShortcut(this.register);
        new TabShortcut(this.register);
        new NavShortcut(this.register);
        new QuickSearch(this.register);
    }

    register(key, fn) {
        if (key instanceof Array) {
            let keys = key.map(k => Shortcut.translate(k));
            log.debug("Shortcurt.register: Key[%s] => [%s]", keys.join(), (fn ? fn.name : ""));
            mousetrap.bind(keys, fn);
        } else {
            log.debug("Shortcurt.register: Key[%s] => [%s]", key, (fn ? fn.name : ""));
            mousetrap.bind(Shortcut.translate(key), fn);
        }
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
        return k.replace("control", "ctrl");
    }

    static registerAll() {
        new Shortcut();
    }
}

module.exports = Shortcut;
