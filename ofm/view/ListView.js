'use strict';

const os = require('os');

const FileAttr = {
    Name: "name",
    Size: "size",
    Type: "type",
    Date: "date",
    Permission: "persission"
}

class ListView {
    constructor(fs, p, dir) {
        this.fs = fs;
        let c = document.createElement("div")
        c.classList.add("window");
        c.classList.add("container-one-row");
        p.appendChild(c);
        this.dom = c;
        this.createUI(c);
        this.registerListener();
        if (!p.views) {
            p.views = new Map();
        }
        p.views.set(dir.fullpath, this);
        dir.children.forEach(f => this.displayFile(f));
        this.adjustPlaceholders();
        window.setTimeout(() => this.adjustUI(), 0);
    }

    registerListener() {
        let attrList = this.dom.querySelector("#file-attr-list");
        let nameList = this.dom.querySelector("#file-name-list");
        let headerList = this.dom.querySelector("#attr-header-list");
        attrList.onscroll = () => {
            if (attrList.ignoreScrollEvent) {
                attrList.ignoreScrollEvent = false;
                return;
            }
            if (nameList.scrollTop != attrList.scrollTop) { 
                nameList.ignoreScrollEvent = true;
                nameList.scrollTop = attrList.scrollTop;
            }
            if (headerList.scrollLeft != attrList.scrollLeft) {
                headerList.ignoreScrollEvent = true;
                headerList.scrollLeft = attrList.scrollLeft;
            }
        };
        nameList.onscroll = () => {
            if (nameList.ignoreScrollEvent) {
                nameList.ignoreScrollEvent = false;
                return;
            }
            if (attrList.scrollTop != nameList.scrollTop) {
                attrList.ignoreScrollEvent = true;
                attrList.scrollTop = nameList.scrollTop;
            }
        };
        headerList.onscroll = () => {
            if (headerList.ignoreScrollEvent) {
                headerList.ignoreScrollEvent = false;
                return;
            }
            if (headerList.scrollLeft != attrList.scrollLeft) {
                attrList.ignoreScrollEvent = true;
                attrList.scrollLeft = headerList.scrollLeft;
            }
        };
        window.addEventListener("resize", () => this.windowResized());
    }

    windowResized() {
        let attr = this.dom.querySelector("#file-attr-list");
        let box = attr.getBoundingClientRect();
        let vsw = box.width - attr.clientWidth + 1;
        let hsh = box.height - attr.clientHeight + 1;
        let nameph = this.dom.querySelector("#file-name-list").nextSibling;
        let headerph = this.dom.querySelector("#attr-header-list>.placeholder");
        nameph.style.height = hsh + "px";
        headerph.style.width = vsw + "px";
    }

    adjustPlaceholders() {
        let name = this.dom.querySelector("#file-name-list");
        let nameph = name.nextSibling;
        nameph.style.width = name.offsetWidth + "px";

        let header = this.dom.querySelector("#attr-header-list");
        let headerph = header.querySelector(".placeholder");
        headerph.style.height = header.offsetHeight + "px";

        this.windowResized();
    }

    createUI(p) {
        let c = document.createElement("div");
        c.classList.add("file-name");
        c.classList.add("container-one-column");
        this.createList(c);
        p.appendChild(c);

        c = document.createElement("div");
        c.classList.add("file-attr");
        c.classList.add("container-one-column");
        p.appendChild(c);
        this.createAttr(c);
    }

    createList(p) {
        this.createHeader(p, "Name");

        let c = document.createElement("div");
        c.id = "file-name-list";
        c.classList.add("container-one-column");
        c.classList.add("y-scrollable");
        c.classList.add("disable-y-scrollbars");
        p.appendChild(c);

        // for same height with attr if it has scroll bar
        let c2 = document.createElement("div");
        c2.classList.add("placeholder");
        p.appendChild(c2);

        p = c;

        c = document.createElement("table");
        p.appendChild(c);

        this.list = c;

    }

    createAttr(p) {
        let c = document.createElement("div");
        c.id = "attr-header-list";
        c.classList.add("header");
        c.classList.add("container-one-row");
        c.classList.add("x-scrollable");
        c.classList.add("disable-x-scrollbars");
        // TODO i18n
        this.createHeader(c, "Size");
        this.createHeader(c, "Date");
        this.createHeader(c, "Type");

        // for same width with table if file-attr-list has scroll bar
        let c2 = document.createElement("div");
        c2.classList.add("placeholder");
        c.appendChild(c2);

        p.appendChild(c);

        c = document.createElement("div")
        c.id = "file-attr-list";
        c.classList.add("scrollable");
        p.appendChild(c);
        p = c;

        c = document.createElement("table");
        p.appendChild(c);

        let tbody = c.createTBody();
       
        this.attr = tbody;
    }

    createHeader(p, name) {
        let c = document.createElement("div");
        c.classList.add("header");
        c.onclick = () => this.sort(name);
        c.asc = undefined;
        p.appendChild(c);
        p = c;
        
        c = document.createElement("span")
        c.innerText = name;
        p.appendChild(c);

        c = document.createElement("div");
        c.classList.add("divider");
        // TODO
        p.appendChild(c);

        c = document.createElement("i");
        c.classList.add("material-icons");
        c.classList.add("invisible");
        c.classList.add("sort-icon");
        c.innerText = "keyboard_arrow_down";
        p.appendChild(c);
    }

    adjustUI() {
        let headers = this.dom.querySelectorAll("#attr-header-list>.header");
        let attrs = this.dom.querySelectorAll("#file-attr-list tr:nth-child(1)>td");
        let tw = 0;
        attrs.forEach((td, i) => {
            let w = Math.max(headers[i].getBoundingClientRect().width + 2, td.getBoundingClientRect().width);
            tw += w;
            headers[i].style.width = w + "px";
            td.style.width = w + "px"; // divider width
        });
        this.dom.querySelector("#file-attr-list table").style.width = tw + "px";
        this.dom.querySelectorAll("#file-attr-list tr").forEach((tr, i) => {
            if (i > 0) {
                Array.from(tr.cells).forEach((td, j) => td.style.width = tr.previousSibling.cells[j].style.width);
            }
        });
    }

    displayFile(f) {
        let namerow = this.list.insertRow();
        this.createItem(namerow, f.name);
        let attrrow = this.attr.insertRow();
        this.createItem(attrrow, f.size);
        this.createItem(attrrow, f.date);
        this.createItem(attrrow, f.type);
        namerow.onmouseover = () => {
            namerow.classList.add("hover");
            attrrow.classList.add("hover");
        };
        namerow.onmouseout = () => {
            namerow.classList.remove("hover");
            attrrow.classList.remove("hover");
        };
        namerow.onclick = () => {
            if (namerow.classList.contains("select")) {
                namerow.classList.remove("select");
                attrrow.classList.remove("select");
            } else {
                namerow.classList.add("select");
                attrrow.classList.add("select");
            }
        }
        namerow.ondblclick = () => {
            this.open(f);
        }
        attrrow.onmouseover = namerow.onmouseover;
        attrrow.onmouseout = namerow.onmouseout;
        attrrow.onclick = namerow.onclick;
        attrrow.ondblclick = namerow.ondblclick;
    }

    async open(f) {
        if (f.isDirectory) {
            if (f.children.length == 0) {
                try {
                    await this.fs.listDir(f);
                } catch (err) {
                    // permission issue, or timeout
                    // TODO display error in status bar
                    console.error(err);
                    return;
                }
            }
            let view = this.dom.parentNode.views.get(f.fullpath);
            if (!view) {
                this.dom.classList.add("hide");
                new ListView(this.fs, this.dom.parentNode, f);
            } else {
                this.dom.classList.add("hide");
                view.show();
            }
        }
    }

    show() {
        this.dom.classList.remove("hide");
    }

    createItem(p, value) {
        let c = p.insertCell();
        c.classList.add("item");
        c.innerText = value;
    }
}

module.exports = ListView;
