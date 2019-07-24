'use strict';

const log = require('../trace/Log.js');

class ErrorView {
    constructor(fs, p, err) {
        log.debug("ErrorVIew for container [%s]", p.id);
        let c = document.createElement("div");
        c.classList.add("window");
        c.classList.add("error");
        c.classList.add("scrollable");
        c.classList.add("container-one-row");
        p.appendChild(c);
        c.innerText = err.toString();
        if (err.stack) {
            c.innerText += "\n" + err.stack;
        }
        this.dom = c;
        this.dom.classList.add("hide");
    }

    show(focus) {
        this.dom.classList.remove("hide");
    }

}

module.exports = ErrorView;
