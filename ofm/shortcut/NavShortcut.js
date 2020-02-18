'use strict';
const log = require('../trace/Log.js');

class NavShortcut {
    constructor(r) {
        let key = ofmconfig.KeyMapping.Navigation;
        r(key.Up, this.moveUp);
        r(key.Down, this.moveDown);
        r(key.Left, this.moveLeft);
        r(key.Right, this.moveRight);
        r(key.Top, this.moveTop);
        r(key.PageUp, this.pageUp);
        r(key.PageDown, this.pageDown);
        r(key.End, this.moveEnd);
        r(key.HomeDir, this.goHome);
        r(key.ParentFolder, this.parentFolder);
        r(key.Refresh, this.refresh);
    }

    refresh() {
        currentTab.refresh();
        return false;
    }

    moveUp() {
        currentTab.moveUp();
        return false;
    }

    moveDown() {
        currentTab.moveDown();
        return false;
    }

    moveLeft() {
        currentTab.moveLeft();
        return false;
    }

    moveRight() {
        currentTab.moveRight();
        return false;
    }

    moveTop() {
        currentTab.moveTop();
        return false;
    }

    moveEnd() {
        currentTab.moveEnd();
        return false;
    }

    parentFolder() {
        log.debug("Nav: Parent Folder");
        let dir = currentTab.dir.parentFile;
        if (dir) {
            currentTab.open(dir);
        }
        return false;
    }

    async goHome() {
        let dir = await currentTab.fs.getHomeDir();
        currentTab.open(dir);
        return false;
    }

    pageUp() {
        currentTab.pageUp();
        return false;
    }

    pageDown() {
        currentTab.pageDown();
        return false;
    }
}

module.exports = NavShortcut;
