'use strict';

const log = require('../trace/Log.js');
const CloudFileSystem = require('../fs/CloudFileSystem.js');
const CloudProviders = require('../fs/cloud/Provider.js');
const Views = require('./ViewTypes.js');
const ListView = require('./ListView.js');

class WaitView {
    constructor(fs, p, view, fullpath) {
        log.debug("WaitView for container [%s]", p.id);
        let c = document.createElement("div");
        c.classList.add("window");
        c.classList.add("wait");
        c.classList.add("container-one-column");
        p.appendChild(c);
        this.dom = c;
        this.dom.classList.add("hide");
        this.fs = fs;
        this.view = view;
        this.fullpath = fullpath;
        if (!(fs instanceof CloudFileSystem)) {
            throw new Error("WaitView for CloudFileSystem only");
        }
        this.createUI(this.dom);
    }

    async check() {
        let all = await this.fs.isAllConnected();
        if (all) {
            switchTo(this.fs, this.view, this.fullpath);
        }
    }

    createUI(p) {
        let dom = p;
        let c = document.createElement("div");
        c.classList.add("container-one-row");
        p.appendChild(c);
        p = c;

        c = document.createElement("button");
        c.value = "Open Home Dir from Local Computer";
        c.onclick = () => switchLocalFS();
        this.fs.providers.forEach(provider => this.createButton(provider, dom));
    }

    async createButton(provider, p) {
        let f = await provider.connection;
        let c = document.createElement("div"); 
        c.classList.add("container-one-row");
        p.appendChild(c);
        p = c;
        
        this.createProviderIcon(provider.provider, c);
        c = document.createElement("span");
        c.innerText = provider.name;
        p.appendChild(c);

        if (f === true) {
            c = document.createElement("span");
            c.innerText = "Connected";
        } else {
            c = document.createElement("button");
            c.innerText = "Connect";
            c.onclick = async () => {
                await provider.connect(true);
                this.check();
            };
        }
        p.appendChild(c);
    }

    createProviderIcon(provider, p) {
        let c = document.createElement("img");
        c.classList = "cloud-provider";
        p.appendChild(c);
        switch (provider) {
            case CloudProviders.GoogleDrive:
                c.src = "./icons/googledrive.svg";
                c.classList.add("big-icon");
                break;
            default:
                throw new Error("Unknown cloud provider: " + provider);
        }
    }

    switchLocalFS() {
        this.switchTo(window.lfs, this.view, window.lfs.homeDir());
    }

    async switchTo(fs, viewType, fullpath) {
        log.debug("WaitView switch to %s [%]", viewType, fullpath);
        let view;
        switch (viewtype.toLowerCase()) {
            case ViewTypes.ListView:
            default:
                let f = await fs.getFile(fullpath);
                view = new ListView(fs, this.dom.parentNode, f);
        }
        await view.show(true);
        this.hide();
    }

    hide() {
        this.dom.classList.add("hide");
    }

    show(focus) {
        this.dom.classList.remove("hide");
    }

}

module.exports = WaitView;
