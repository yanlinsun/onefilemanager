'use strict';

const os = require('os');
const filesize = require('filesize');
const { ExtFileType, TypeIcon } = require('../fs/FileType.js');
const log = require('electron-log');

const FileAttr = {
    Name: "name",
    Size: "size",
    Type: "type",
    Date: "date",
    Permission: "persission"
}

class ListView {
    constructor(fs, p, dir) {
        this.pfx = "LView[" + dir.fullpath + "]: ";
        log.debug(this.pfx + "enter");
        this.fs = fs;
        this.dir = dir;
        let c = document.createElement("div")
        c.classList.add("window");
        c.classList.add("file");
        c.classList.add("listview");
        c.classList.add("container-one-row");
        p.appendChild(c);
        this.dom = c;
        this.dom.classList.add("hide");
        this.createUI(c);
        this.registerListener();
        if (!p.views) {
            p.views = new Map();
        }
        p.views.set(dir.fullpath, this);
        dir.children.forEach(f => this.displayFile(f));
        log.debug(this.pfx + " exit");
    }

    registerListener() {
        log.debug(this.pfx + "registerListener");
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
        window.addEventListener("resize", this.resize);
        this.dom.onclick = () => {
            if (window.currentTab !== this) {
                let opsite = window.currentTab;
                window.currentTab = this;
                this.focus();
                window.opsiteTab = opsite;
                opsite.blur();
            }
        }
    }

    deregisterListener() {
        log.debug(this.pfx + "deregisterListener");
        window.removeEventListener("resize", this.resize);
    }

    resize = () => this.windowResized();

    windowResized() {
        log.debug(this.pfx + "resize");
        let attr = this.dom.querySelector("#file-attr-list");
        let box = attr.getBoundingClientRect();
        let vsw = box.width - attr.clientWidth + 1;
        let hsh = box.height - attr.clientHeight + 1;
        let nameph = this.dom.querySelector("#file-name-list").nextSibling;
        let headerph = this.dom.querySelector("#attr-header-list>.placeholder");
        log.debug(this.pfx + " name placeholder.height =  " + hsh);
        nameph.style.height = hsh + "px";
        log.debug(this.pfx + " header placeholder.width = " + vsw);
        headerph.style.width = vsw + "px";
    }

    adjustPlaceholders() {
        log.debug(this.pfx + "adjustPlaceholders");
        let name = this.dom.querySelector("#file-name-list");
        let nameph = name.nextSibling;
        log.debug(this.pfx + " name placeholder.width =  " + name.offsetWidth);
        nameph.style.width = name.offsetWidth + "px";

        let header = this.dom.querySelector("#attr-header-list");
        let headerph = header.querySelector(".placeholder");
        log.debug(this.pfx + " header placeholder.height = " + header.offsetHeight);
        headerph.style.height = header.offsetHeight + "px";

        this.windowResized();
    }

    createUI(p) {
        let c = document.createElement("div");
        c.id = "name-header";
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
        this.createHeader(p, "Name", "name");

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

        this.nameTable = c;

    }

    createAttr(p) {
        let c = document.createElement("div");
        c.id = "attr-header-list";
        c.classList.add("header-container");
        c.classList.add("container-one-row");
        c.classList.add("x-scrollable");
        c.classList.add("disable-x-scrollbars");
        // TODO i18n
        this.createHeader(c, "Size", "size");
        this.createHeader(c, "Date", "date");
        this.createHeader(c, "Type", "type");

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
       
        this.attrTable = tbody;
    }

    createIcon(icon) {
        let i = document.createElement("i");
        i.classList.add("material-icons");
        i.innerText = icon;
        return i;
    }

    createHeader(p, name, sortAttr) {
        let i = this.createIcon("keyboard_arrow_down");
        i.classList.add("invisible");
        i.classList.add("sort-icon");

        let c = document.createElement("div");
        c.classList.add("header");
        c.onclick = () => this.sort(i, sortAttr);
        c.asc = undefined;
        p.appendChild(c);
        p = c;
        
        c = document.createElement("span")
        c.innerText = name;
        p.appendChild(c);

        c = document.createElement("div");
        c.classList.add("divider");
        p.appendChild(c);

        p.appendChild(i);
    }

    sort(header, attr) {
        log.debug(this.pfx + "sort: " + attr);
        if (header.asc === undefined) {
            header.asc = false;
        }
        let asc = header.asc = !header.asc;
        let icons = this.dom.querySelectorAll(".header i");
        icons.forEach(i => {
            if (!i.classList.contains("invisible")) {
                i.classList.add("invisible");
            }
        });
        header.classList.remove("invisible");
        if (asc) {
            header.innerText = "keyboard_arrow_up";
        } else {
            header.innerText = "keyboard_arrow_down";
        }
        Array.from(this.nameTable.rows).slice(1).sort((a, b) => ((v1, v2) => {
            if (v1 !== '' && v2 !== '' && !isNaN(v1) && !isNaN(v2)) { 
                return v1 - v2; 
            } else {
                return v1.localeCompare(v2);
            }
        })(
            asc ? a.file[attr] : b.file[attr], 
            asc ? b.file[attr] : a.file[attr]
        )).forEach((tr, i) => {
            this.nameTable.appendChild(tr);
            this.attrTable.appendChild(tr.attr);
        });
    }

    adjustUI() {
        log.debug(this.pfx + "adjustUI");
        let headers = this.dom.querySelectorAll("#attr-header-list>.header");
        let attrs = this.dom.querySelectorAll("#file-attr-list tr:nth-child(1)>td");
        let tw = 0;
        attrs.forEach((td, i) => {
            let w = Math.max(headers[i].getBoundingClientRect().width + 2, td.getBoundingClientRect().width);
            tw += w;
            log.debug(this.pfx + " " + headers[i].innerText + ".width = " + w);
            headers[i].style.width = w + "px";
            td.style.width = w + "px"; // divider width
        });
        log.debug(this.pfx + " table.width = " + tw);
        this.dom.querySelector("#file-attr-list table").style.width = tw + "px";
        this.dom.querySelectorAll("#file-attr-list tr").forEach((tr, i) => {
            if (i > 0) {
                Array.from(tr.cells).forEach((td, j) => td.style.width = tr.previousSibling.cells[j].style.width);
            }
        });

        this.adjustPlaceholders();
    }

    displayFile(f) {
        if (f.isHidden && !ofmconfig.General.ShowHidden) {
            return;
        }
        let namerow = this.nameTable.insertRow();
        namerow.file = f;
        let icon = "default";
        if (f.isDirectory) {
            icon = "folder";
        } else if (ExtFileType[f.ext]) {
            icon = ExtFileType[f.ext];
        }
        let itemOption = { rightAlign: false, icon: TypeIcon[icon], hidden: f.isHidden };
        this.createItem(namerow, f.name, itemOption);
        let attrrow = this.attrTable.insertRow();
        namerow.attr = attrrow;
        itemOption.icon = null;
        itemOption.rightAlign = true;
        this.createItem(attrrow, isNaN(f.size) ? f.size : filesize(f.size), itemOption);
        itemOption.rightAlign = false;
        this.createItem(attrrow, f.date, itemOption);
        this.createItem(attrrow, f.type, itemOption);
        namerow.onmouseover = () => {
            namerow.classList.add("hover");
            attrrow.classList.add("hover");
        };
        namerow.onmouseout = () => {
            namerow.classList.remove("hover");
            attrrow.classList.remove("hover");
        };
        namerow.onclick = () => {
            let selected = this.dom.querySelectorAll(".file .selected");
            Array.from(selected).forEach(tr => {
                tr.classList.remove("selected")
                tr.classList.remove("focus");
            });
            if (!namerow.classList.contains("selected")) {
                namerow.classList.add("selected");
                namerow.classList.add("focus");
                attrrow.classList.add("selected");
                attrrow.classList.add("focus");
                this.repositionFocus();
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
            log.debug(this.pfx + "open dir [" + f.fullpath + "]");
            if (f.children.length == 0) {
                try {
                    log.debug(this.pfx + " list children");
                    await this.fs.listDir(f);
                } catch (err) {
                    // permission issue, or timeout
                    // TODO display error in status bar
                    log.error(err);
                    return;
                }
            }
            let view = this.dom.parentNode.views.get(f.fullpath);
            if (!view) {
                view = new ListView(this.fs, this.dom.parentNode, f);
            }
            this.switchTo(view);
        } else {
            log.debug(this.pfx + "open file [" + f.fullpath + "]");
            this.fs.open(f);
        }
    }

    switchTo(view) {
        log.debug(this.pfx + "switchTo [" + view.dir.fullpath + "]");
        if (currentTab === this) {
            currentTab = view;
        } else if (opsiteTab === this) {
            opsiteTab = view;
        } else {
            throw new Error("Program error: no tab defined");
        }
        view.show(this.isFocused());
        this.hide();
    }

    isFocused() {
        return this.dom.classList.contains("focus");
    }

    hide() {
        log.debug(this.pfx + "hide");
        this.dom.classList.add("hide");
        this.blur();
    }

    show(focus) {
        log.debug(this.pfx + "show " + focus);
        this.dom.classList.remove("hide");
        window.setTimeout(() => this.adjustUI(), 0);
        if (focus) {
            this.focus();
        }
    }

    focus() {
        log.debug(this.pfx + "focus");
        if (!this.dom.classList.contains("focus")) {
            if (window.currentTab !== this) {
                log.debug(this.pfx + " switch tab");
                window.opsiteTab = window.currentTab;
                window.opsiteTab.blur();
                window.currentTab = this;
            }
            this.dom.classList.add("focus");
        }
    }

    blur() {
        this.dom.classList.remove("focus");
    }

    createItem(p, value, option) {
        let c = p.insertCell();
        c.classList.add("item");
        let i = null;
        if (option.icon) {
            i = this.createIcon(option.icon);
            c.appendChild(i);
        }
        p = c;

        c = document.createElement("SPAN");
        p.appendChild(c);
        if (option.rightAlign) {
            c.classList.add("align-right");
        }
        if (option.hidden) {
            if (i) {
                i.classList.add("hidden-file");
            }
            c.classList.add("hidden-file");
        }
        if (value instanceof Date) {
            c.innerText = value.toLocaleString();
        } else {
            c.innerText = value;
        }
    }

    getSelectedFiles() {
        let selected = this.nameTable.querySelectorAll(".selected");
        return Array.from(selected).map(tr => tr.file);
    }

    async refresh() {
        log.debug(this.pfx + "refresh");
        this.deregisterListener();
        await this.fs.listDir(this.dir, true);
        let view = new ListView(this.fs, this.dom.parentNode, this.dir);
        let nameList = this.dom.querySelector("#file-name-list");
        let pos = nameList.scrollTop;
        this.switchTo(view);
        log.debug(this.pfx + " set scrolltop = " + pos);
        view.dom.querySelector("#file-name-list").scrollTop = pos;
    }

    moveUp() {
        let row = this.nameTable.querySelector(".focus");
        if (row && row.previousSibling) {
            row.previousSibling.click();
        } else {
            this.nameTable.rows[0].click();
        }
    }

    moveDown() {
        let row = this.nameTable.querySelector(".focus");
        if (row && row.nextSibling) {
            row.nextSibling.click();
        } else {
            this.nameTable.rows[0].click();
        }
    }

    moveLeft() {
    }

    moveRight() {
    }

    moveTop() {
        this.nameTable.rows[0].click();
    }

    moveEnd() {
        this.nameTable.rows[this.nameTable.rows.length - 1].click();
    }

    pageUp() {
        let focusRow = this.nameTable.querySelector(".focus");
        let nameList = this.dom.querySelector("#file-name-list");
        let boxRect = nameList.getBoundingClientRect();
        let objs = document.elementsFromPoint(boxRect.left + 3, boxRect.top + 1);
        for (let o of Array.from(objs).values()) {
            if (o.tagName === "TD") {
                let targetRow = o.parentNode;
                let rowRect = targetRow.getBoundingClientRect();
                if (rowRect.top < boxRect.top) {
                    targetRow = targetRow.nextSibling;
                    rowRect = targetRow.getBoundingClientRect();
                }
                if (targetRow !== focusRow) {
                    targetRow.click();
                } else {
                    let cnt = Math.floor(boxRect.height / rowRect.height);
                    let rows = Array.from(this.nameTable.rows);
                    let focusIdx = rows.indexOf(focusRow);
                    let targetIdx = Math.max(0, focusIdx - cnt);
                    rows[targetIdx].click();
                }
                break;
            }
        }
    }

    pageDown() {
        let focusRow = this.nameTable.querySelector(".focus");
        let nameList = this.dom.querySelector("#file-name-list");
        let boxRect = nameList.getBoundingClientRect();
        let objs = document.elementsFromPoint(boxRect.left + 3, boxRect.bottom - 1);
        for (let o of Array.from(objs).values()) {
            if (o.tagName === "TD") {
                let targetRow = o.parentNode;
                let rowRect = targetRow.getBoundingClientRect();
                if (rowRect.bottom > boxRect.bottom) {
                    targetRow = targetRow.previousSibling;
                    rowRect = targetRow.getBoundingClientRect();
                }
                if (targetRow !== focusRow) {
                    targetRow.click();
                } else {
                    let cnt = Math.floor(boxRect.height / rowRect.height);
                    let rows = Array.from(this.nameTable.rows);
                    let focusIdx = rows.indexOf(focusRow);
                    let targetIdx = Math.min(rows.length - 1, focusIdx + cnt);
                    rows[targetIdx].click();
                }
                break;
            }
        }
    }

    repositionFocus() {
        let focusRect = this.nameTable.querySelector(".focus").getBoundingClientRect();
        let nameList = this.dom.querySelector("#file-name-list");
        let boxRect = nameList.getBoundingClientRect();
        if (focusRect.top < boxRect.top) {
            nameList.scrollTop -= boxRect.top - focusRect.top;
        } else if (focusRect.bottom > boxRect.bottom) {
            nameList.scrollTop += focusRect.bottom - boxRect.bottom;
        }
    }
}

module.exports = ListView;
