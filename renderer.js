// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
'use strict';

const LocalFileSystem = require('./ofm/fs/LocalFileSystem.js');
const ListView = require('./ofm/view/ListView.js');
const Configuration = require('./ofm/config/configuration.js');

window.ofmconfig = Configuration.load();

async function init() {
    let containers = document.querySelectorAll(".file-container")
    let fs = new LocalFileSystem();
    let dir = fs.homeDir();
    await fs.listDir(dir);

    new ListView(fs, containers[0], dir);
    new ListView(fs, containers[1], dir);
}

init();
