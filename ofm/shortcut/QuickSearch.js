'use strict';
const sprintf = require('sprintf-js').sprintf;
const log = require('../trace/Log.js');

class QuickSearch {
    constructor(r) {
        r("Esc", this.resetSearch);
        r(Array.from("abcdefghijklmnopqrstuvwxyz0123456789"), (e, key) => this.quickSearch(key));
        this.applyConfig();
    }

    applyConfig() {
        if (ofmconfig.QuickSearch) {
            if (ofmconfig.QuickSearch.Alternative) {
                try {
                    let usage = [ 
                        "\n\nYour QuickSearch implementation should implement:",
                        " filter(files, keys) {",
                        "   <your filter code> ",
                        "   return filteredArray;",
                        " }",
                        " parameter:",
                        "   files - string array: file names, not fullpath, file.ext only",
                        "   keys - string array: user typed keys in array",
                        " return:",
                        "   string array: filtered filenames"
                    ].join("\n");
                    let p = path.resolve(ofmconfig.QuickSearch.Alternative);
                    let o = require(p);
                    if (!o.filter) {
                        throw new Error("No filter method in your implementation" + usage);
                    }
                    if (o.filter instanceof Function) {
                        if (o.filter.length !== 2) {
                            throw new Error(sprintf("Method filter has %i parameter(s), it should and only should has 2 parameters") + usage);
                        }
                    } else {
                        throw new Error("No filter method found" + usage);
                    }
                    this.method = o.filter;
                } catch (err) {
                    log.error(err);
                    log.toUser("QuickSearch config [%s] is invalid\n%s", ofmconfig.QuickSearch, err.toString());
                }
            }
            if (ofmconfig.QuickSearch.Timeout) {
                this.timeout = ofmconfig.QuickSearch.Timeout;
            }
        }
        if (!this.method) {
            this.method = this.nativeMethod;
        }
        if (!this.timeout) {
            this.timeout = 2000;
        }
    }

    quickSearch(key) {
        log.debug("QuickSearch: %s", key);
        if (!this.id) {
            // new session
            this.id = setTimeout(() => this.clear(), this.timeout);
            this.keys = [];
            this.files = currentTab.getFilenames();
            this.fullFiles = this.files.slice();
        } else {
            this.resetTimeout();
        }
        if (key === "Backspace") {
            this.keys.pop();
            this.files = this.fullFiles.slice();
        } else {
            this.keys.push(key);
            if (this.files.length === 0) {
                return;
            }
        }
        try {
            let filtered = this.method(this.files, this.keys.slice());
            if (filtered instanceof Array) {
                log.debug("QuickSearch filter [%i] => [%i]", this.files.length, filtered.length);
                if (filtered.length === 0) {
                    this.keys.pop();
                } else {
                    currentTab.filter(filtered);
                    this.files = filtered;
                }
            }
        } catch (err) {
            log.error(err);
            log.toUser(err.toString());
        }
    }

    resetSearch() {
        log.debug("Reset QuickSearch");
        currentTab.clearFilter();
    }

    resetTimeout() {
        clearTimeout(this.id);
        this.id = setTimeout(() => this.clear(), this.timeout);
    }

    clear() {
        if (!this.notimeout) { // only for debug
            log.debug("QuickSearch clear");
            this.id = null;
            this.keys = null; 
            this.files = null;
        }
    }

    nativeMethod(files, keys) {
        let p = keys.join("");
        log.debug("QuickSearch key: [%s]", p);
        return files.filter(f => f.toLowerCase().indexOf(p.toLowerCase()) !== -1);
    }
}

module.exports = QuickSearch;
