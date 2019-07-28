'use strict';

const FileSystem = require('./fs/FileSystemEnum.js');
const LocalFileSystem = require('./fs/LocalFileSystem.js');
const CloudFileSystem = require('./fs/CloudFileSystem.js');
const ListView = require('./view/ListView.js');
const ErrorView = require('./view/ErrorView.js');
const log = require('./trace/Log.js');

const Views = [ "ListView", "ThumbView", "QuickPreview", "SlideView" ];

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
        r.fs = p[1] === "Cloud" ? cloudfs : lfs;
        r.fullpath = p[2];
    } else if (p.length > 1) {
        r.fs = p[0] === "Cloud" ? cloudfs : lfs;
        r.fullpath = p[1];
    } else {
        r.fullpath = setting;
    }
    return r;
}

async function createTab(setting, container) {
    let t = parse(setting);
    switch (t.view) {
        case Views[0]:
        default:
            log.debug("Initialize ListView: [%s] for container [%s]", t.fullpath, container.id);
            let f;
            try {
                f = await t.fs.getDir(t.fullpath);
                log.debug("dir read finished [%s]", container.id);
            } catch (err) {
                log.error("Error occurs [%s]", container.id);
                log.error(err);
            }
            try {
                if (!f) {
                    // probably not found, load home dir
                    log.error("Default directory [%s] not exist, use home dir instead [%s]", t.fullpath, container.id);
                    f = await t.fs.getHomeDir();
                }
                return new ListView(t.fs, container, f);
            } catch (err) {
                return new ErrorView(t.fs, container, err);
            }
            break;
    }
}

async function start() {
    log.verbose("OneFileManager start");
    // initialize filesystems
    window.lfs = new LocalFileSystem();
    window.cloudfs = new CloudFileSystem();

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
