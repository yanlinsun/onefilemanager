'use strict';

const LocalFileSystem = require('./fs/LocalFileSystem.js');
const ListView = require('./view/ListView.js');
const ErrorView = require('./view/ErrorView.js');
const log = require('./trace/Log.js');

async function createTab(setting, container) {
    let i = setting.indexOf(":"), view, dir;

    if (i > 0) {
        view = setting.substring(0, i);
        if (view.indexOf("View") == -1) {
            view = "ListView";
            dir = setting;
        } else {
            dir = setting.substring(i + 1);
        }
    } else {
        view = "ListView";
        dir = setting;
    }
    switch (view) {
        case "ListView":
        default:
            log.debug("Initialize ListView: %s", dir);
            let fs = new LocalFileSystem();
            let f;
            try {
                f = await fs.getDir(dir);
                log.debug("dir read finished");
            } catch (err) {
                log.error(err);
            }
            try {
                if (!f) {
                    // probably not found, load home dir
                    log.error("Default directory [%s] not exist, use home dir instead", dir);
                    f = await fs.getHomeDir();
                }
                return new ListView(fs, container, f);
            } catch (err) {
                return new ErrorView(fs, container, err);
            }
            break;
    }
}

async function start() {
    log.verbose("OneFileManager start");
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
