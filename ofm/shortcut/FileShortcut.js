'use strict';

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
        r(key.DeletePermanently, () => this.deleteFile(true));
        r(key.Open, this.open);
    }

    async move() {
        let files = currentTab.getSelectedFiles();
        let target = opsiteTab.dir;
        let fs = opsiteTab.fs;
        let result = await fs.move(currentTab.fs, files, target);
        currentTab.refresh();
        opsiteTab.refresh();
        return false;
    }

    async open() {
        let file = currentTab.getFocusFile();
        currentTab.open(file);
        return false;
    }

    async copy() {
        let files = currentTab.getSelectedFiles();
        let target = opsiteTab.dir;
        let fs = opsiteTab.fs;
        let result = await fs.copy(currentTab.fs, files, target);
        opsiteTab.refresh();
        return false;
    }

    async deleteFile(permnanently) {
        let files = currentTab.getSelectedFiles();
        let fs = currentTab.fs;
        let result = await fs.delete(files);
        currentTab.refresh();
        return false;
    }

}

module.exports = FileShortcut;
