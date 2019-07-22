'use strict';

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
    }

    moveUp() {
        currentTab.moveUp();
    }

    moveDown() {
        currentTab.moveDown();
    }

    moveLeft() {
        currentTab.moveLeft();
    }

    moveRight() {
        currentTab.moveRight();
    }

    moveTop() {
        currentTab.moveTop();
    }

    moveEnd() {
        currentTab.moveEnd();
    }

    parentFolder() {
        let dir = currentTab.dir.parentDir();
        currentTab.open(dir);
    }

    async goHome() {
        let dir = await currentTab.fs.getHomeDir();
        currentTab.open(dir);
    }

    pageUp() {
        currentTab.pageUp();
    }

    pageDown() {
        currentTab.pageDown();
    }
}

module.exports = NavShortcut;
