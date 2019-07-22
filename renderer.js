// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
'use strict';

const OfmLog = require('./ofm/trace/Log.js');
const Configuration = require('./ofm/config/Configuration.js');
const Shortcut = require('./ofm/shortcut/Shortcut.js');
const ofm = require('./ofm/ofm.js');

function init() {
    window.ofmconfig = Configuration.load();
    Shortcut.registerAll();
    OfmLog.init();

    ofm.start();
}

init();
