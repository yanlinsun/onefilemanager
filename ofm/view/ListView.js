'use strict';

const os = require('os');
const path = require('path');
const File = require('./File.js');

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
        this.createUI(p);
    }

    createUI(p) {
        this.createList(p);
        this.createAttr(p);
    }

    createList(p) {
        let c = document.createElement("div");
        c.classList.add("file_list");
        p.appendChild(c);
        p = c;

        this.createHeader(p, "Name");

        c = document.createElement("div");
        c.classList.add("container");
        p.appendChild(c);

        this.list = c;
    }

    createAttr(p) {
        let c = document.createElement("div");
        c.classList.add("file_attr");
        p.appendChild(c);
        c = document.createElement("div");
        c.classList.add("container");
        // TODO i18n
        this.createHeader(c, "Size");
        this.createHeader(c, "Date");
        this.createHeader(c, "Type");
        p.appendChild(c);

        c = document.createElement("table");
//        c.classList.add("container");
        p.appendChild(c);

        this.attr = c;
    }

    createHeader(p, name) {
        let c = document.createElement("div");
        c.classList.add("header");
        c.onclick = () => this.sort(name);
        c.asc = undefined;
        p.appendChild(c);
        
        c = document.createElement("span")
        c.innerText = name;
        p.appendChild(c);

        c = document.createElement("i");
        c.classList.add("material-icons");
        c.classList.add("hide");
        c.classList.add("sort-icon");
        c.innerText = "keyboard_arrow_down";
        p.appendChild(c);

        c = document.createElement("div");
        c.classList.add("divider");
        // TODO
        p.appendChild(c);
    }

    async showDefaultDir() {
        try {
            let dir = os.homedir();
            let files = await this.fs.listDir(dir);
            files.forEach(f => {
                new File(path.join(dir, f), this);
            });
        } catch (err) {
            console.error(err);
        }
    }

    showFile(f) {
        this.createName(f.name);
        let row = this.attr.insertRow();
        this.createItem(row, f.size);
        this.createItem(row, f.ctime);
        this.createItem(row, f.type);
    }

    createName(name) {
        let c = document.createElement("div");
        c.classList.add("item");
        c.innerText = name;
        this.list.appendChild(c);
    }

    createItem(p, value) {
//        let c = document.createElement("div");
//        c.className.add("item");
//        p.appendChild(c);
        let c = p.insertCell();
        c.innerText = value;
    }
}

module.exports = ListView;
