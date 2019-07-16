// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
'use strict';

const LocalFileSystem = require('./ofm/fs/LocalFileSystem.js');
const ListView = require('./ofm/view/ListView.js');

function init() {
    let containers = document.querySelectorAll(".file_container")

    new ListView(new LocalFileSystem(), containers[0]).showDefaultDir();
    new ListView(new LocalFileSystem(), containers[1]).showDefaultDir();
}

init();
