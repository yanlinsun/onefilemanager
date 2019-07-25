'use strict';
const { remote } = require('electron');
const { BrowserWindow, ipcMain } = remote;
const log = require('../trace/Log.js');

class FileShortcut {
    constructor(r) {
        let key = ofmconfig.KeyMapping.File;
        r(key.Copy, this.copy);
        r(key.Move, this.move);
        r(key.CreateFile, () => this.createFile());
        r(key.CreateFolder, () => this.createFolder());
        r(key.Edit, this.edit);
        r(key.CopyToClipboard, this.copyToClipboard);
        r(key.PasteFromClipboard, this.pasteFromClipboard);
        r(key.SelectAll, this.selectAll);
        r(key.Select, this.select);
        r(key.Delete, this.deleteFile);
        r(key.DeletePermanently, () => this.deleteFile(true));
        r(key.Open, this.open);
        this.init();
    }

    init() {
        ipcMain.on('FilenameReady', async (event, name, type) => {
            log.debug("CreateFile receive filename [%s] type [%s]", name, type);
            if (name && name !== "") {
                if (type === "file") {
                    currentTab.fs.createFile(name, currentTab.dir);
                } else {
                    currentTab.fs.createFolder(name, currentTab.dir);
                }
                await currentTab.refresh();
                currentTab.locate(name);
            }
        });
    }

    async move() {
        let files = currentTab.getSelectedFiles();
        if (files.length > 0) {
            let target = opsiteTab.dir;
            let fs = opsiteTab.fs;
            let result = await fs.move(currentTab.fs, files, target);
            currentTab.refresh();
            opsiteTab.refresh();
        }
        return false;
    }

    async open() {
        let file = currentTab.getFocusFile();
        currentTab.open(file);
        return false;
    }

    async copy() {
        let files = currentTab.getSelectedFiles();
        if (files.length > 0) {
            let target = opsiteTab.dir;
            let fs = opsiteTab.fs;
            let result = await fs.copy(currentTab.fs, files, target);
            opsiteTab.refresh();
        }
        return false;
    }

    async deleteFile(permnanently) {
        let files = currentTab.getSelectedFiles();
        if (files.length > 0) {
            let fs = currentTab.fs;
            let result = await fs.delete(files);
            currentTab.refresh();
        }
        return false;
    }

    select() {
        currentTab.selectFocus();
        return false;
    }

    selectAll() {
        currentTab.selectAll();
        return false;
    }

    createFile() {
        this.openCreateFileWindow("file", currentTab.dir.fullpath);
        return false;
    }

    createFolder() {
        this.openCreateFileWindow("folder", currentTab.dir.fullpath);
        return false;
    }

    openCreateFileWindow(type, target) {
        let win = new BrowserWindow({
            width: 400,
            height: 250,
            webPreferences: {
                nodeIntegration: true
            }
        });
       
        win.loadFile("./ofm/view/CreateFile.html");
        win.on('closed', function() {
            win = null;
        });
        win.on('blur', function() {
            win.close();
        });
        win.webContents.on('did-finish-load', () => {
            win.webContents.send('init', type, target);
        });
    }

}

module.exports = FileShortcut;
