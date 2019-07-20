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
    let left = ofmconfig.Tabs.Active.Left;
    let right = ofmconfig.Tabs.Active.Right;
    let dirLeft = await fs.getDir(left); 
    let dirRight = null;
    if (left == right) {
        dirRight = dirLeft;
    } else {
        dirRight = await fs.getDir(right);
    }

    new ListView(fs, containers[0], dirLeft);
    new ListView(fs, containers[1], dirRight);
}

init();
