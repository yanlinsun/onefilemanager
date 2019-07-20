'use strict';

const LocalFileSystem = require('./fs/LocalFileSystem.js');
const ListView = require('./view/ListView.js');

async function createTab(setting, container) {
    let i = setting.indexOf(":"), view, dir;

    if (i > 0) {
        view = setting(0, i);
        if (view.indexOf("View") == -1) {
            view = "ListView";
            dir = setting;
        } else {
            dir = setting(i + 1);
        }
    } else {
        view = "ListView";
        dir = setting;
    }
    switch (view) {
        case "ListView":
        default:
            let fs = new LocalFileSystem();
            dir = await fs.getDir(dir);
            return new ListView(fs, container, dir);
    }
}

async function start() {
    let containers = document.querySelectorAll(".file-container")
    let leftTabs = ofmconfig.Tabs.Left.map(t => createTab(t, containers[0]));
    let rightTabs = ofmconfig.Tabs.Left.map(t => createTab(t, containers[1]));
    leftTabs = await Promise.all(leftTabs);
    rightTabs = await Promise.all(rightTabs);
    let f = false;
    for (let t of leftTabs.values()) {
        if (t.dir == ofmconfig.Tabs.Active.Left) {
            f = true;
            t.show();
        }
    }
    if (!f) {
        leftTabs[0].show();
    }
    f = false;
    for (let t of rightTabs.values()) {
        if (t.dir == ofmconfig.Tabs.Active.Right) {
            f = true;
            t.show();
        }
    }
    if (!f) {
        rightTabs[0].show();
    }
}

module.exports = {
    start
}
