// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
'use strict';

const os = require('os');
const LocalFileSystem = require('./ofm/fs/LocalFileSystem.js');
const ListView = require('./ofm/view/ListView.js');

function init() {
    let containers = document.querySelectorAll(".file-container")
    let dir = os.homedir();
    let lfs = new LocalFileSystem();

    new ListView(lfs, containers[0]).showDir(dir);
    new ListView(lfs, containers[1]).showDir(dir);
}

init();
