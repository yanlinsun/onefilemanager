'use strict';

const FileSystem = require('./fs/FileSystemEnum.js');
const LocalFileSystem = require('./fs/LocalFileSystem.js');
const DelayLocalFileSystem = require('./fs/DelayLocalFileSystem.js');
const CloudFileSystem = require('./fs/CloudFileSystem.js');
const ListView = require('./view/ListView.js');
const ErrorView = require('./view/ErrorView.js');
const log = require('./trace/Log.js');

const Views = [ "ListView", "ThumbView", "QuickPreview", "SlideView" ];

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
        r.view = Views.indexOf(p[0]) === -1 ? Views[0] : p[0];
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

async function createTab(setting, container) {
    let t = parse(setting);
    log.debug("Create Tab %s: [%s] for container [%s]", Views[0], t.fullpath, container.id);
    switch (t.view) {
        case Views[0]:
        default:
            let f;
            try {
                f = await t.fs.getFile(t.fullpath);
            } catch (err) {
                log.error("File [%s] read error [%s]", t.fullpath, container.id);
                log.error(err);
            }
            try {
                if (!f) {
                    // probably not found, load home dir
                    log.error("Use home dir instead [%s]", container.id);
                    f = await t.fs.getHomeDir();
                }
                return new ListView(t.fs, container, f);
            } catch (err) {
                return new ErrorView(t.fs, container, err);
            }
            break;
    }
}

function initFilesystems() {
    // initialize filesystems
    window.lfs = new LocalFileSystem();
    window.cloudfs = new CloudFileSystem();
}

async function start() {
    log.verbose("OneFileManager start");

    initFilesystems();

    let containers = document.querySelectorAll(".file-container")
    let leftTabs = ofmconfig.Tabs.Left.map(t => createTab(t, containers[0]));
    let rightTabs = ofmconfig.Tabs.Right.map(t => createTab(t, containers[1]));
    leftTabs = await Promise.all(leftTabs);
    rightTabs = await Promise.all(rightTabs);
    let left, right;
    for (left of leftTabs.values()) {
        if (left.dir == ofmconfig.Tabs.Active.Left) {
            break;
        }
    }
    window.currentTab = left;
    left.show(true);
    for (right of rightTabs.values()) {
        if (right.dir == ofmconfig.Tabs.Active.Right) {
            break;
        }
    }
    window.opsiteTab = right;
    right.show();

}

module.exports = {
    start
}
