'use strict';

const log = require('electron-log');

class FileShortcut {
    constructor(r) {
        let key = ofmconfig.KeyMapping.File;
        r(key.Copy, this.copy);
        r(key.Move, this.move);
        r(key.CreateFile, this.createFile);
        r(key.CreateFolder, this.createFolder);
        r(key.Edit, this.edit);
        r(key.CopyToClipboard, this.copyToClipboard);
        r(key.PasteFromClipboard, this.pasteFromClipboard);
        r(key.SelectAll, this.selectAll);
        r(key.Select, this.select);
        r(key.Delete, this.deleteFile);
        r(key.DeletePermanently, this.deletePermanently);
        r(key.Open, this.open);
    }

    async move() {
        log.debug("Shortcut: move enter");
        let files = currentTab.getSelectedFiles();
        log.debug("Files: " + files.length);
        let target = opsiteTab.dir;
        log.debug("Target: " + target.fullpath);
        let fs = opsiteTab.fs;
        let result = await fs.move(currentTab.fs, files, target);
        log.debug("Shortcut: move finished");
        currentTab.refresh();
        opsiteTab.refresh();
        log.debug("Shortcut: move exit");
    }

    async open() {
        let file = currentTab.getFocusFile();
        currentTab.open(file);
    }
}

module.exports = FileShortcut;
