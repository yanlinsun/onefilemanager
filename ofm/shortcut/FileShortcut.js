'use strict';

const { globalShortcut } = require('electron');

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

    move() {
        let files = currentTab.getSelectedFiles();
        let target = opsiteTab.dir;
        let fs = opsiteTab.fs;
        fs.move(currentTab.fs, files, target);
    }
}

module.exports = FileShortcut;
