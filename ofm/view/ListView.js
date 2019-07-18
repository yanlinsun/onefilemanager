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
    constructor(fs, p) {
        this.fs = fs;
        this.dom = p;
        this.createUI(p);
        this.registerListener();
    }

    registerListener() {
        let attrList = this.dom.querySelector("#file-attr-list");
        let nameList = this.dom.querySelector("#file-name-list");
        let headerList = this.dom.querySelector("#attr-header-list");
        attrList.onscroll = () => {
            nameList.scrollTop = attrList.scrollTop;
            headerList.scrollLeft = attrList.scrollLeft;
        };
        nameList.onscroll = () => attrList.scrollTop = nameList.scrollTop;
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
        c.classList.add("hide");
        c.classList.add("sort-icon");
        c.innerText = "keyboard_arrow_down";
        p.appendChild(c);
    }

    async showDir(dir) {
        try {
            let files = await this.fs.listDir(dir);
            files.forEach(f => this.showFile(f));
        } catch (err) {
            console.error(err);
        }
        this.adjustUI();
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

        this.adjustPlaceholders();
    }

    showFile(f) {
        this.createName(f.name);
        let row = this.attr.insertRow();
        this.createItem(row, f.size);
        this.createItem(row, f.date);
        this.createItem(row, f.type);
    }

    createName(name) {
//        let c = document.createElement("div");
//        c.classList.add("item");
        let c = this.list.insertRow().insertCell();
        c.classList.add("item");
        c.innerText = name;
    }

    createItem(p, value) {
//        let c = document.createElement("div");
//        c.className.add("item");
//        p.appendChild(c);
        let c = p.insertCell();
        c.classList.add("item");
        c.innerText = value;
    }
}

module.exports = ListView;
