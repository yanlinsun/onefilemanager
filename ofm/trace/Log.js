'use strict';

const log = require('electron-log');
const path = require('path');

function init() {
    if (ofmconfig.Trace && ofmconfig.Trace.File && ofmconfig.Trace.File != "") {
        let file = ofmconfig.Trace.File;
        if (ofmconfig.indexOf("%APP_DIR%") != -1) {
            file = file.replace("%APP_DIR%", '.');
            file = path.resolve(file);
        }
        console.log("Log file: " + file);
        log.transport.file.fileName = file;
    }
}

module.exports = { init };
