'use strict';

const log = require('electron-log');
const path = require('path');

function init() {
    if (ofmconfig.Trace) {
        if (ofmconfig.Trace.File && ofmconfig.Trace.File != "") {
            let file = ofmconfig.Trace.File;
            if (file.indexOf("%APP_DIR%") != -1) {
                file = file.replace("%APP_DIR%", '.');
                file = path.resolve(file);
            }
            console.log("Log file: " + file);
            log.transports.file.fileName = file;
        }
        if (ofmconfig.Trace.Level) {
            console.log("Log level: " + ofmconfig.Trace.Level);
            log.transports.file.level = ofmconfig.Trace.Level;
        }
    }
}

module.exports = { init };
