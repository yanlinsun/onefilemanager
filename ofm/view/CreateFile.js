'use strict';
const { remote, ipcRenderer } = require('electron');

const log = require('../trace/Log.js');

let defaultType;

ipcRenderer.on('init', (event, type) => {
    log.debug("CreateFile: type [%s]", type);
    defaultType = type;
    if (type === "file") {
        document.querySelector("#type_file").classList.add("focus");
    } else {
        document.querySelector("#type_folder").classList.add("focus");
    }
});

function init() {
    document.addEventListener("keydown", keypress);
    document.querySelector("#type_file").onclick = () => create("file");
    document.querySelector("#type_folder").onclick = () => create("folder");
    document.querySelector("#file_name").focus();
}

function keypress(e) {
    if (e.key === "Enter") {
        create(defaultType);
    } else if (e.key === "Escape") {
        close();
    }
}

function create(type) {
    ipcRenderer.send("FilenameReady", document.querySelector("#file_name").value, type);
    close();
}

function close() {
    log.debug("CreateFile window close");
    remote.getCurrentWindow().close();
}

init();
