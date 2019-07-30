'use strict';

const FileSystem = require('./fs/FileSystemEnum.js');
const LocalFileSystem = require('./fs/LocalFileSystem.js');
const DelayLocalFileSystem = require('./fs/DelayLocalFileSystem.js');
const CloudFileSystem = require('./fs/CloudFileSystem.js');
const ListView = require('./view/ListView.js');
const ErrorView = require('./view/ErrorView.js');
const WaitView = require('./view/WaitView.js');
const log = require('./trace/Log.js');

const Views = require('./view/ViewTypes.js');

function getFilesystem(val) {
    if (!val || val === "") {
        return window.lfs;
    }
    switch (val.toLowerCase()) {
        case "cloud":
            return window.cloudfs;
        case "delay":
            if (!window.dlfs) {
                window.dlfs = new DelayLocalFileSystem();
            }
            return window.dlfs;
        default:
            return window.lfs;
    }
}

function parse(setting) {
    // [ <View> or ListView [| <FS> or Local]|]<fullpath>
    let p = setting.split("|");
    let r = {
        view: Views[0],
        fs: lfs,
        fullpath: null
    };
    if (p.length > 2) {
        r.view = Views.AllTypes.indexOf(p[0]) === -1 ? Views[0] : p[0];
        r.fs = getFilesystem(p[1]);
        r.fullpath = p[2];
    } else if (p.length > 1) {
        r.fs = getFilesystem(p[0]);
        r.fullpath = p[1];
    } else {
        r.fullpath = setting;
    }
    return r;
}

async function getFile(t) {
    let f;
    try {
        f = await t.fs.getFile(t.fullpath);
    } catch (err) {
        if (err.code === 'ENOENT') {
            log.error("[%s] File [%s] not found, Use home dir instead", container.id);
            t.message = log.printf("%s not found, use home dir instead", t.fullpath);
            f = await t.fs.getHomeDir();
        } else if (err.code === 'ECANCELLED') {
            log.error("[%s] Cloud login cancelled, use LocalFileSystem home dir instead", container.id);
            t.message = log.printf("Cloud initialized failed, use home dir instead", t.fullpath);
            t.fs = window.lfs;
            t.fullpath = t.fs.getHomeDir();
            f = await t.fs.getHomeDir();
        } else {
            throw err;
        }
    }
    return f;
}

async function createTab(setting, container) {
    let t = parse(setting);
    log.debug("Create Tab %s: [%s] for container [%s]", t.view, t.fullpath, container.id);
    if (t.fs instanceof CloudFileSystem) {
        let all = await t.fs.isAllConnected();
        if (!all) {
            return new WaitView(t.fs, container, t.view, t.fullpath);
        }
    }
    try {
        let f = await getFile(t);
        switch (t.view) {
            case Views[0]:
            default:
                return new ListView(t.fs, container, f, t.message);
                break;
        }
    } catch (err) {
        return new ErrorView(t.fs, container, err);
    }
}

function initFilesystems() {
    // initialize filesystems
    window.lfs = new LocalFileSystem();
    window.cloudfs = new CloudFileSystem();
}

async function startTab(tabs, container, activeTab) {
    let createdTabs = tabs.map(t => createTab(t, container));
    createdTabs = await Promise.all(createdTabs);
    let tab;
    for (tab of createdTabs.values()) {
        if (tab.dir == activeTab) {
            break;
        }
    }
    tab.show();
    return tab;
}

async function start() {
    log.verbose("OneFileManager start");

    initFilesystems();

    let containers = document.querySelectorAll(".file-container")
    let tabs = [ 
        startTab(ofmconfig.Tabs.Left, containers[0], ofmconfig.Tabs.Active.Left), 
        startTab(ofmconfig.Tabs.Right, containers[1], ofmconfig.Tabs.Active.Right), 
    ];

    tabs = await Promise.all(tabs);

    window.currentTab = tabs[0];
    window.currentTab.focus();
    window.opsiteTab = tabs[1];
}

module.exports = {
    start
}
